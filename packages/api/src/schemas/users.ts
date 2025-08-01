/**
 * User management validation schemas
 */

import { z } from 'zod';
import {
  paginationSchema, sortSchema, idSchema, userRoleSchema
} from './common';

// Profile update
export const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/)
    .optional(),
  email: z.string().email().max(255).optional(),
  bio: z.string().max(500).optional(),
  image: z.string().url().optional(),
  website: z.string().url().optional(),
  location: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  twitter: z.string().max(50).optional(),
  github: z.string().max(50).optional(),
  linkedin: z.string().max(50).optional()
});

// Get user profile
export const getUserProfileSchema = z.object({
  username: z.string().min(1)
});

export const getUserByIdSchema = z.object({
  userId: idSchema
});

// Follow/unfollow user
export const followUserSchema = z.object({
  userId: idSchema
});

export const unfollowUserSchema = z.object({
  userId: idSchema
});

// Get followers/following
export const getFollowersSchema = z.object({
  userId: idSchema,
  ...paginationSchema.shape
});

export const getFollowingSchema = z.object({
  userId: idSchema,
  ...paginationSchema.shape
});

// Search users
export const searchUsersSchema = z.object({
  query: z.string().min(1).max(100),
  role: userRoleSchema.optional(),
  verified: z.boolean().optional(),
  active: z.boolean().optional(),
  ...paginationSchema.shape,
  ...sortSchema.shape
});

// User settings
export const updateSettingsSchema = z.object({
  emailNotifications: z.object({
    newFollower: z.boolean().default(true),
    articleComment: z.boolean().default(true),
    articleLike: z.boolean().default(true),
    weeklyDigest: z.boolean().default(true),
    productUpdates: z.boolean().default(false)
  }).optional(),
  pushNotifications: z.object({
    newFollower: z.boolean().default(true),
    articleComment: z.boolean().default(true),
    articleLike: z.boolean().default(true)
  }).optional(),
  privacy: z.object({
    showEmail: z.boolean().default(false),
    showProfile: z.boolean().default(true),
    allowMessages: z.boolean().default(true),
    showActivity: z.boolean().default(true)
  }).optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'auto']).default('auto'),
    language: z.string().length(2).default('en'),
    timezone: z.string().default('UTC'),
    articlePageSize: z.number().int().min(5).max(50)
      .default(20)
  }).optional()
});

// Account management
export const deleteAccountSchema = z.object({
  password: z.string().min(1),
  confirmation: z.literal('DELETE MY ACCOUNT')
});

export const deactivateAccountSchema = z.object({
  reason: z.string().max(500).optional()
});

export const reactivateAccountSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1)
});

// User verification
export const requestVerificationSchema = z.object({
  verificationType: z.enum(['email', 'phone', 'identity'])
});

export const submitVerificationSchema = z.object({
  verificationType: z.enum(['email', 'phone', 'identity']),
  token: z.string().min(1),
  verificationData: z.record(z.unknown()).optional()
});

// Block/unblock users
export const blockUserSchema = z.object({
  userId: idSchema,
  reason: z.string().max(500).optional()
});

export const unblockUserSchema = z.object({
  userId: idSchema
});

export const getBlockedUsersSchema = z.object({
  ...paginationSchema.shape
});

// Report user
export const reportUserSchema = z.object({
  userId: idSchema,
  reason: z.enum(['spam', 'harassment', 'inappropriate', 'copyright', 'other']),
  description: z.string().max(1000),
  evidence: z.array(z.string().url()).max(5).optional()
});

// User statistics
export const getUserStatsSchema = z.object({
  userId: idSchema,
  period: z.enum(['day', 'week', 'month', 'year']).default('month')
});

// Reading history
export const getReadingHistorySchema = z.object({
  ...paginationSchema.shape,
  timeframe: z.enum(['today', 'week', 'month', 'all']).default('all')
});

export const markAsReadSchema = z.object({
  articleId: idSchema,
  readingTime: z.number().int().min(0).optional() // in seconds
});

// Reading list management
export const createReadingListSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(false)
});

export const updateReadingListSchema = z.object({
  listId: idSchema,
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional()
});

export const addToReadingListSchema = z.object({
  listId: idSchema,
  articleId: idSchema
});

export const removeFromReadingListSchema = z.object({
  listId: idSchema,
  articleId: idSchema
});

export const getReadingListsSchema = z.object({
  userId: idSchema.optional(),
  ...paginationSchema.shape
});
