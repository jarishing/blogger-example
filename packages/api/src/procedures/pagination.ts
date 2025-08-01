/**
 * Pagination-related procedures and utilities
 */

import { z } from 'zod';
import { publicProcedure } from '../trpc';
import { paginationSchema } from '../schemas';

/**
 * Enhanced pagination schema with sorting
 */
export const paginationWithSortSchema = paginationSchema.extend({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

/**
 * Procedure for paginated list operations
 */
export const paginatedListProcedure = publicProcedure.input(paginationWithSortSchema);

/**
 * Utility function to create pagination metadata
 */
export const createPaginationMeta = (
  page: number,
  limit: number,
  total: number
) => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
};

/**
 * Utility function to calculate offset from page and limit
 */
export const calculateOffset = (page: number, limit: number): number => (page - 1) * limit;
