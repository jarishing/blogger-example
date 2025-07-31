import {
  pgTable, text, timestamp, varchar
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './users';

export const articles = pgTable('article', {
  articleId: varchar('article_id', { length: 64 }).primaryKey(),
  title: varchar('title', { length: 120 }).notNull(),
  slug: varchar('slug', { length: 120 }).notNull().unique(),
  description: varchar('description', { length: 250 }).notNull(),
  body: text('body').notNull(),
  userId: varchar('user_id', { length: 64 }).notNull().references(() => users.userId, { onDelete: 'cascade' }),
  recordStatus: varchar('record_status', { length: 10 }).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const articleFavorites = pgTable('article_favorite', {
  articleFavoriteId: varchar('article_favorite_id', { length: 64 }).primaryKey(),
  userId: varchar('user_id', { length: 64 }).notNull().references(() => users.userId, { onDelete: 'cascade' }),
  articleId: varchar('article_id', { length: 64 }).notNull().references(() => articles.articleId, { onDelete: 'cascade' }),
  recordStatus: varchar('record_status', { length: 10 }).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const comments = pgTable('article_comment', {
  articleCommentId: varchar('article_comment_id', { length: 64 }).primaryKey(),
  body: text('body').notNull(),
  articleId: varchar('article_id', { length: 64 }).notNull().references(() => articles.articleId, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 64 }).notNull().references(() => users.userId, { onDelete: 'cascade' }),
  recordStatus: varchar('record_status', { length: 10 }).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const articleTags = pgTable('article_tag', {
  articleTagId: varchar('article_tag_id', { length: 64 }).primaryKey(),
  articleId: varchar('article_id', { length: 64 }).notNull(),
  tag: varchar('tag', { length: 150 }).notNull(),
  recordStatus: varchar('record_status', { length: 10 }).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Zod schemas for validation
export const insertArticleSchema = createInsertSchema(articles, {
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(250),
  body: z.string().min(1).max(50000),
  slug: z.string().min(1).max(120)
});

export const selectArticleSchema = createSelectSchema(articles);

export const insertCommentSchema = createInsertSchema(comments, {
  body: z.string().min(1).max(1000)
});

export const selectCommentSchema = createSelectSchema(comments);

export const insertArticleFavoriteSchema = createInsertSchema(articleFavorites);
export const selectArticleFavoriteSchema = createSelectSchema(articleFavorites);

export const insertArticleTagSchema = createInsertSchema(articleTags, {
  tag: z.string().min(1).max(150)
});
export const selectArticleTagSchema = createSelectSchema(articleTags);

// Types
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type ArticleFavorite = typeof articleFavorites.$inferSelect;
export type NewArticleFavorite = typeof articleFavorites.$inferInsert;
export type ArticleTag = typeof articleTags.$inferSelect;
export type NewArticleTag = typeof articleTags.$inferInsert;
