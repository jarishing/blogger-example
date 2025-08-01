/**
 * Article-related validation schemas
 */

import { z } from 'zod';
import {
  paginationSchema, sortSchema, idSchema, slugSchema, contentTypeSchema, publicationStatusSchema
} from './common';

// Article creation
export const createArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120, 'Title must be less than 120 characters'),
  description: z.string().min(1, 'Description is required').max(250, 'Description must be less than 250 characters'),
  body: z.string().min(1, 'Content is required').max(50000, 'Content must be less than 50,000 characters'),
  tags: z.array(z.string().max(50)).max(10, 'Maximum 10 tags allowed').default([]),
  categories: z.array(z.string().max(50)).max(5, 'Maximum 5 categories allowed').default([]),
  featuredImage: z.string().url().optional(),
  status: publicationStatusSchema.default('draft'),
  scheduledAt: z.date().optional(),
  contentType: contentTypeSchema.default('article')
});

// Article update
export const updateArticleSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().min(1).max(250).optional(),
  body: z.string().min(1).max(50000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  categories: z.array(z.string().max(50)).max(5).optional(),
  featuredImage: z.string().url().optional(),
  status: publicationStatusSchema.optional(),
  scheduledAt: z.date().optional()
});

// Get article by slug
export const getArticleBySlugSchema = z.object({
  slug: slugSchema
});

// Get article by ID
export const getArticleByIdSchema = z.object({
  articleId: idSchema
});

// Delete article
export const deleteArticleSchema = z.object({
  articleId: idSchema
});

// Article search and filtering
export const searchArticlesSchema = z.object({
  query: z.string().max(255).optional(),
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  author: z.string().optional(),
  status: publicationStatusSchema.optional(),
  contentType: contentTypeSchema.optional(),
  publishedAfter: z.date().optional(),
  publishedBefore: z.date().optional(),
  featured: z.boolean().optional(),
  sortBy: z.enum(['createdAt', 'publishedAt', 'title', 'views', 'favorites']).default('createdAt'),
  ...paginationSchema.shape,
  ...sortSchema.shape
});

// Article feed
export const articleFeedSchema = z.object({
  following: z.boolean().default(false),
  personalized: z.boolean().default(false),
  includeScheduled: z.boolean().default(false),
  excludeRead: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  ...paginationSchema.shape
});

// Comment creation
export const createCommentSchema = z.object({
  articleId: idSchema,
  body: z.string().min(1, 'Comment body is required').max(1000, 'Comment must be less than 1000 characters'),
  parentId: idSchema.optional() // for nested comments
});

// Comment update
export const updateCommentSchema = z.object({
  commentId: idSchema,
  body: z.string().min(1).max(1000)
});

// Get comments
export const getCommentsSchema = z.object({
  articleId: idSchema,
  parentId: idSchema.optional(),
  ...paginationSchema.shape
});

// Delete comment
export const deleteCommentSchema = z.object({
  commentId: idSchema
});

// Article favorites
export const favoriteArticleSchema = z.object({
  articleId: idSchema
});

export const unfavoriteArticleSchema = z.object({
  articleId: idSchema
});

// Get favorites
export const getFavoritesSchema = z.object({
  userId: idSchema.optional(), // if not provided, get current user's favorites
  ...paginationSchema.shape
});

// Article series
export const createSeriesSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  coverImage: z.string().url().optional(),
  tags: z.array(z.string().max(50)).max(10).default([])
});

export const updateSeriesSchema = z.object({
  seriesId: idSchema,
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(500).optional(),
  coverImage: z.string().url().optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  isPublished: z.boolean().optional()
});

export const addToSeriesSchema = z.object({
  seriesId: idSchema,
  articleId: idSchema,
  order: z.number().int().min(1).optional()
});

// Tags management
export const getTagsSchema = z.object({
  query: z.string().max(100).optional(),
  popular: z.boolean().default(false),
  limit: z.number().int().min(1).max(100)
    .default(20)
});

export const followTagSchema = z.object({
  tagId: idSchema
});

export const unfollowTagSchema = z.object({
  tagId: idSchema
});

// Article analytics
export const getArticleAnalyticsSchema = z.object({
  articleId: idSchema,
  period: z.enum(['day', 'week', 'month', 'year']).default('week'),
  startDate: z.date().optional(),
  endDate: z.date().optional()
});
