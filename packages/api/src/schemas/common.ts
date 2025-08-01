/**
 * Common validation schemas used across multiple routers
 */

import { z } from 'zod';

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100)
    .default(20)
});

// Sort schema
export const sortSchema = z.object({
  field: z.string(),
  direction: z.enum(['asc', 'desc']).default('desc')
});

// ID schemas
export const idSchema = z.string().min(1);
export const slugSchema = z.string().min(1).max(120);

// Search schema
export const searchSchema = z.object({
  query: z.string().min(1).max(255),
  ...paginationSchema.shape
});

// Base entity fields
export const baseEntitySchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date()
});

// Record status
export const recordStatusSchema = z.enum(['active', 'inactive', 'deleted']);

// User roles
export const userRoleSchema = z.enum(['admin', 'moderator', 'user', 'premium']);

// Content type
export const contentTypeSchema = z.enum(['article', 'tutorial', 'news', 'opinion']);

// Publication status
export const publicationStatusSchema = z.enum(['draft', 'published', 'scheduled', 'archived']);
