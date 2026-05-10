import authRepository from '../repository/auth.repository';
import { hashPassword, comparePassword, generateTokenPair, verifyRefreshToken } from '../../../common/utils';
import { ConflictError, UnauthorizedError, NotFoundError, BadRequestError } from '../../../common/exceptions';
import { RegisterInput, LoginInput, ChangePasswordInput } from '../validation/auth.validation';
import { IJwtPayload } from '../../../common/interfaces';
import logger from '../../../config/logger';
import env from '../../../config/env';

export class AuthService {
  // Register new user
  async register(data: RegisterInput) {
    // Check if email already exists
    const existingUser = await authRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user + profile in transaction
    const { user, profile } = await authRepository.createUserWithProfile(
      { email: data.email, password: hashedPassword, is_active: true },
      { email: data.email, full_name: data.full_name, role: data.role }
    );

    // Assign default role
    await authRepository.assignRole(user.id, data.role);

    // Get user roles
    const userRoles = await authRepository.getUserRoles(user.id);

    // Generate tokens
    const payload: IJwtPayload = {
      userId: user.id,
      email: user.email,
      roles: userRoles,
    };

    const tokens = generateTokenPair(payload);

    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await authRepository.saveRefreshToken({
      userId: user.id,
      token: tokens.refreshToken,
      expires_at: expiresAt,
    });

    logger.info({ userId: user.id }, 'User registered successfully');

    return {
      id: user.id,
      email: user.email,
      full_name: profile.full_name,
      role: profile.role || data.role,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  // Login
  async login(data: LoginInput) {
    const user = await authRepository.findUserByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.is_active) {
      throw new UnauthorizedError('Account is deactivated');
    }

    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Get user roles
    const userRoles = await authRepository.getUserRoles(user.id);

    // Generate tokens
    const payload: IJwtPayload = {
      userId: user.id,
      email: user.email,
      roles: userRoles,
    };

    const tokens = generateTokenPair(payload);

    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await authRepository.saveRefreshToken({
      userId: user.id,
      token: tokens.refreshToken,
      expires_at: expiresAt,
    });

    // Get profile
    const profile = await authRepository.getProfile(user.id);

    logger.info({ userId: user.id }, 'User logged in successfully');

    return {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name || '',
      role: profile?.role || 'OWNER',
      roles: userRoles,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  // Logout
  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await authRepository.revokeRefreshToken(refreshToken);
    } else {
      await authRepository.revokeAllUserTokens(userId);
    }
    logger.info({ userId }, 'User logged out');
  }

  // Refresh token
  async refreshToken(token: string) {
    const storedToken = await authRepository.findRefreshToken(token);

    if (!storedToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (storedToken.is_revoked) {
      throw new UnauthorizedError('Refresh token has been revoked');
    }

    if (new Date(storedToken.expires_at) < new Date()) {
      throw new UnauthorizedError('Refresh token has expired');
    }

    // Verify JWT
    const decoded = verifyRefreshToken(token);

    // Revoke old token (rotation)
    await authRepository.revokeRefreshToken(token);

    // Get fresh roles
    const userRoles = await authRepository.getUserRoles(decoded.userId);

    // Generate new token pair
    const payload: IJwtPayload = {
      userId: decoded.userId,
      email: decoded.email,
      roles: userRoles,
    };

    const tokens = generateTokenPair(payload);

    // Save new refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await authRepository.saveRefreshToken({
      userId: decoded.userId,
      token: tokens.refreshToken,
      expires_at: expiresAt,
    });

    return tokens;
  }

  // Forgot password
  async forgotPassword(email: string) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      // Don't reveal that user doesn't exist
      return { message: 'If the email exists, a reset link will be sent' };
    }

    // Generate a temporary reset token (in production, send via email)
    const payload: IJwtPayload = {
      userId: user.id,
      email: user.email,
      roles: ['RESET'],
    };

    const resetToken = generateTokenPair(payload).accessToken;

    logger.info({ userId: user.id }, 'Password reset requested');

    return {
      message: 'If the email exists, a reset link will be sent',
      resetToken, // In production, send via email, don't return in response
    };
  }

  // Reset password
  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = verifyRefreshToken(token);
      const hashedPassword = await hashPassword(newPassword);
      await authRepository.updatePassword(decoded.userId, hashedPassword);
      await authRepository.revokeAllUserTokens(decoded.userId);

      logger.info({ userId: decoded.userId }, 'Password reset successful');

      return { message: 'Password reset successful' };
    } catch {
      throw new BadRequestError('Invalid or expired reset token');
    }
  }

  // Change password
  async changePassword(userId: string, data: ChangePasswordInput) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const isPasswordValid = await comparePassword(data.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestError('Current password is incorrect');
    }

    const hashedPassword = await hashPassword(data.newPassword);
    await authRepository.updatePassword(userId, hashedPassword);
    await authRepository.revokeAllUserTokens(userId);

    logger.info({ userId }, 'Password changed successfully');

    return { message: 'Password changed successfully' };
  }

  // Get current user
  async getCurrentUser(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const profile = await authRepository.getProfile(userId);
    const userRoles = await authRepository.getUserRoles(userId);

    return {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name || '',
      role: profile?.role || 'OWNER',
      roles: userRoles,
      is_active: user.is_active,
      created_at: user.created_at.toISOString(),
    };
  }
}

export default new AuthService();
