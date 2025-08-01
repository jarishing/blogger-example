/**
 * Base types and common interfaces for the blogger application
 */

// Base entity interface that all database entities extend
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Record status enum matching the database schema
export type RecordStatus = 'active' | 'banned' | 'deleted' | 'draft';

// Generic entity with record status
export interface EntityWithStatus extends BaseEntity {
  recordStatus: RecordStatus;
}

// Pagination interfaces
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Sort and filter interfaces
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  tags?: string[];
  author?: string;
  status?: RecordStatus;
  dateFrom?: Date;
  dateTo?: Date;
}

// API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: Date;
}

// Error interfaces
export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  details?: Record<string, unknown>;
  stack?: string;
}

export interface ValidationError extends ApiError {
  field?: string;
  value?: unknown;
  constraints?: string[];
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Database relation types
export type RelationOptions = {
  include?: string[];
  select?: string[];
  orderBy?: Record<string, 'asc' | 'desc'>;
};

// Common enums
export enum ContentType {
  ARTICLE = 'article',
  PAGE = 'page',
  DRAFT = 'draft',
  TEMPLATE = 'template'
}

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  AUTHOR = 'author',
  SUBSCRIBER = 'subscriber',
  GUEST = 'guest'
}

export enum PublicationStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  SCHEDULED = 'scheduled',
  ARCHIVED = 'archived'
}
