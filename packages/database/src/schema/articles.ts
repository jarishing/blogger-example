import { pgTable, text, timestamp, uuid, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";

export const articles = pgTable("articles", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  body: text("body").notNull(),
  tagList: json("tag_list").$type<string[]>().default([]),
  favoritesCount: integer("favorites_count").default(0),
  authorId: uuid("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const articleFavorites = pgTable("article_favorites", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  articleId: uuid("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  body: text("body").notNull(),
  articleId: uuid("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas for validation
export const insertArticleSchema = createInsertSchema(articles, {
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(500),
  body: z.string().min(1).max(50000),
  tagList: z.array(z.string()).optional(),
});

export const selectArticleSchema = createSelectSchema(articles);

export const insertCommentSchema = createInsertSchema(comments, {
  body: z.string().min(1).max(1000),
});

export const selectCommentSchema = createSelectSchema(comments);

export const insertArticleFavoriteSchema = createInsertSchema(articleFavorites);
export const selectArticleFavoriteSchema = createSelectSchema(articleFavorites);

export const insertTagSchema = createInsertSchema(tags);
export const selectTagSchema = createSelectSchema(tags);

// Types
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type ArticleFavorite = typeof articleFavorites.$inferSelect;
export type NewArticleFavorite = typeof articleFavorites.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;