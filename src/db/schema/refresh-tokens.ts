import { pgTable, uuid, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  is_revoked: boolean('is_revoked').default(false).notNull(),
  expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_refresh_tokens_user_id').on(table.userId),
  tokenIdx: index('idx_refresh_tokens_token').on(table.token),
  expiresAtIdx: index('idx_refresh_tokens_expires_at').on(table.expires_at),
}));

export const insertRefreshTokenSchema = createInsertSchema(refreshTokens);
export const selectRefreshTokenSchema = createSelectSchema(refreshTokens);

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;
