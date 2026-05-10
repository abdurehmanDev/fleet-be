import db from '../../../config/db';
import { users, profiles, refreshTokens, userRoles, roles } from '../../../db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { User, NewUser } from '../../../db/schema/users';
import { Profile, NewProfile } from '../../../db/schema/profiles';
import { RefreshToken, NewRefreshToken } from '../../../db/schema/refresh-tokens';

export class AuthRepository {
  // Find user by email (non-deleted)
  async findUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deleted_at)))
      .limit(1);
    return user;
  }

  // Find user by ID
  async findUserById(id: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deleted_at)))
      .limit(1);
    return user;
  }

  // Create user with profile in transaction
  async createUserWithProfile(userData: NewUser, profileData: Omit<NewProfile, 'id'>): Promise<{ user: User; profile: Profile }> {
    const result = await db.transaction(async (tx) => {
      const [user] = await tx.insert(users).values(userData).returning();
      const [profile] = await tx.insert(profiles).values({
        ...profileData,
        id: user.id,
      }).returning();
      return { user, profile };
    });
    return result;
  }

  // Assign role to user
  async assignRole(userId: string, roleName: string): Promise<void> {
    const [role] = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1);
    if (role) {
      await db.insert(userRoles).values({ userId, roleId: role.id });
    }
  }

  // Get user roles
  async getUserRoles(userId: string): Promise<string[]> {
    const result = await db
      .select({ name: roles.name })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId));

    return result.map((r) => r.name);
  }

  // Update password
  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ password: hashedPassword, updated_at: new Date() })
      .where(eq(users.id, userId));
  }

  // Save refresh token
  async saveRefreshToken(data: NewRefreshToken): Promise<RefreshToken> {
    const [token] = await db.insert(refreshTokens).values(data).returning();
    return token;
  }

  // Find refresh token
  async findRefreshToken(token: string): Promise<RefreshToken | undefined> {
    const [rt] = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, token))
      .limit(1);
    return rt;
  }

  // Revoke refresh token
  async revokeRefreshToken(token: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ is_revoked: true })
      .where(eq(refreshTokens.token, token));
  }

  // Revoke all user refresh tokens
  async revokeAllUserTokens(userId: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ is_revoked: true })
      .where(eq(refreshTokens.userId, userId));
  }

  // Get user profile
  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);
    return profile;
  }

  // Cleanup expired tokens
  async cleanupExpiredTokens(): Promise<void> {
    await db
      .delete(refreshTokens)
      .where(
        and(
          eq(refreshTokens.is_revoked, true),
        )
      );
  }
}

export default new AuthRepository();
