/**
 * API type definitions for tRPC context and shared types
 */

import type { User } from '@conduit/types';

/**
 * Minimal Express types for context
 */
export interface RequestLike {
  ip?: string;
  connection?: { remoteAddress?: string };
  get: (name: string) => string | undefined;
}

export interface ResponseLike {
  // Add response properties as needed
}

/**
 * tRPC Context - available in all procedures
 */
export interface Context {
  req: RequestLike;
  res: ResponseLike;
  user?: User;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create context function type
 */
export type CreateContextOptions = {
  req: RequestLike;
  res: ResponseLike;
};

/**
 * Common response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: Date;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Common input schemas
 */
export interface PaginationInput {
  page?: number;
  limit?: number;
}

export interface SortInput {
  field: string;
  direction: 'asc' | 'desc';
}
