import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const uploadedFiles = pgTable('uploaded_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  publicId: text('public_id').notNull(),
  originalName: text('original_name'),
  mimeType: text('mime_type'),
  size: text('size'),
  folder: text('folder'),
  entityType: text('entity_type'),
  entityId: uuid('entity_id'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_uploaded_files_user_id').on(table.userId),
  entityIdx: index('idx_uploaded_files_entity').on(table.entityType, table.entityId),
}));

export const insertUploadedFileSchema = createInsertSchema(uploadedFiles);
export const selectUploadedFileSchema = createSelectSchema(uploadedFiles);

export type UploadedFile = typeof uploadedFiles.$inferSelect;
export type NewUploadedFile = typeof uploadedFiles.$inferInsert;
