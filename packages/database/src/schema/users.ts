import {
  pgTable, text, timestamp, varchar, pgEnum
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Enums
export const recordStatusEnum = pgEnum('record_status', ['active', 'banned']);

export const users = pgTable('user', {
  userId: varchar('user_id', { length: 64 }).primaryKey(),
  email: varchar('email', { length: 250 }).notNull().unique(),
  username: varchar('username', { length: 64 }).notNull().unique(),
  hash: varchar('hash', { length: 64 }).notNull(),
  bio: text('bio'),
  image: text('image'),
  recordStatus: recordStatusEnum('record_status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const userFollows = pgTable('user_follow', {
  userFollowId: varchar('user_follow_id', { length: 64 }).primaryKey(),
  followerId: varchar('follower_id', { length: 64 }).notNull().references(() => users.userId, { onDelete: 'cascade' }),
  followingId: varchar('following_id', { length: 64 }).notNull().references(() => users.userId, { onDelete: 'cascade' }),
  recordStatus: varchar('record_status', { length: 10 }).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  username: z.string().min(3).max(64),
  hash: z.string().min(1).max(64),
  bio: z.string().max(500).optional(),
  image: z.string().url().optional()
});

export const selectUserSchema = createSelectSchema(users);

export const insertUserFollowSchema = createInsertSchema(userFollows);
export const selectUserFollowSchema = createSelectSchema(userFollows);

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserFollow = typeof userFollows.$inferSelect;
export type NewUserFollow = typeof userFollows.$inferInsert;
