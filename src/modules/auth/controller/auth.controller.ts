import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import authService from '../service/auth.service';
import { ApiResponse } from '../../../common/responses';
import { asyncHandler } from '../../../middlewares/error.middleware';

export class AuthController {
  // POST /api/v1/auth/register
  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    res.status(StatusCodes.CREATED).json(
      ApiResponse.success('User registered successfully', result)
    );
  });

  // POST /api/v1/auth/login
  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);

    // Set refresh token in httpOnly cookie
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(StatusCodes.OK).json(
      ApiResponse.success('Login successful', result)
    );
  });

  // POST /api/v1/auth/logout
  logout = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const refreshToken = req.cookies?.refresh_token;
    await authService.logout(userId, refreshToken);

    res.clearCookie('refresh_token');
    res.status(StatusCodes.OK).json(
      ApiResponse.success('Logged out successfully', null)
    );
  });

  // POST /api/v1/auth/refresh-token
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshToken(refreshToken);

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(StatusCodes.OK).json(
      ApiResponse.success('Token refreshed successfully', tokens)
    );
  });

  // POST /api/v1/auth/forgot-password
  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.forgotPassword(req.body.email);
    res.status(StatusCodes.OK).json(
      ApiResponse.success(result.message, result)
    );
  });

  // POST /api/v1/auth/reset-password
  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.resetPassword(req.body.token, req.body.password);
    res.status(StatusCodes.OK).json(
      ApiResponse.success(result.message, null)
    );
  });

  // PATCH /api/v1/auth/change-password
  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const result = await authService.changePassword(userId, req.body);
    res.status(StatusCodes.OK).json(
      ApiResponse.success(result.message, null)
    );
  });

  // GET /api/v1/auth/me
  me = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const result = await authService.getCurrentUser(userId);
    res.status(StatusCodes.OK).json(
      ApiResponse.success('User fetched successfully', result)
    );
  });
}

export default new AuthController();
