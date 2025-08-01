/**
 * API-related types for the blogger application
 */

// Base entity fields are now explicitly defined in each interface

// Generic API response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  meta?: ResponseMeta;
  timestamp: Date;
}

// Response metadata
export interface ResponseMeta {
  requestId: string;
  version: string;
  processingTime: number;
  rateLimit?: RateLimitInfo;
  pagination?: PaginationMeta;
  warnings?: string[];
}

// Pagination metadata
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextPage?: number;
  prevPage?: number;
}

// Rate limiting information
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
  policy: string;
}

// Error response structure
export interface ApiError {
  code: string;
  message: string;
  details?: ErrorDetails;
  statusCode: number;
  timestamp: Date;
  path?: string;
  requestId?: string;
  stack?: string; // only in development
}

// Error details
export interface ErrorDetails {
  field?: string;
  value?: unknown;
  constraints?: Record<string, string>;
  children?: ErrorDetails[];
  context?: Record<string, unknown>;
}

// Validation error
export interface ValidationError extends ApiError {
  validationErrors: Array<{
    field: string;
    value: unknown;
    constraints: string[];
    children?: ValidationError[];
  }>;
}

// Health check response
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  uptime: number;
  version: string;
  environment: string;
  services: Record<string, ServiceHealth>;
  metrics: HealthMetrics;
}

// Service health status
export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  lastCheck: Date;
  error?: string;
  version?: string;
}

// Health metrics
export interface HealthMetrics {
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  cpuUsage: number;
  activeConnections: number;
  requestsPerMinute: number;
  errorRate: number;
}

// Analytics and metrics
export interface AnalyticsEvent {
  eventId: string;
  userId?: string;
  sessionId?: string;
  eventType: string;
  eventData: Record<string, unknown>;
  metadata: EventMetadata;
  timestamp: Date;
}

// Event metadata
export interface EventMetadata {
  userAgent?: string;
  ipAddress?: string;
  referer?: string;
  device?: DeviceInfo;
  location?: LocationInfo;
  utm?: UTMParameters;
}

// Device information
export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  version: string;
  screenSize?: string;
  language?: string;
}

// Location information
export interface LocationInfo {
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// UTM parameters for tracking
export interface UTMParameters {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

// Webhook types
export interface WebhookEvent {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  eventId: string;
  eventType: string;
  payload: Record<string, unknown>;
  headers: Record<string, string>;
  signature?: string;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'delivered' | 'failed' | 'expired';
  nextRetryAt?: Date;
  deliveredAt?: Date;
  errorMessage?: string;
}

// Webhook subscription
export interface WebhookSubscription {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  subscriptionId: string;
  userId: string;
  url: string;
  events: string[];
  secret?: string;
  isActive: boolean;
  retryPolicy: RetryPolicy;
  lastDeliveryAt?: Date;
  failureCount: number;
  metadata?: Record<string, unknown>;
}

// Retry policy for webhooks
export interface RetryPolicy {
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential';
  initialDelay: number;
  maxDelay: number;
  retryOn: number[]; // HTTP status codes to retry on
}

// File upload types
export interface FileUpload {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  bucket?: string;
  key?: string;
  uploadedBy: string;
  uploadedAt: Date;
  metadata?: Record<string, unknown>;
}

// Image upload with processing
export interface ImageUpload extends FileUpload {
  dimensions: {
    width: number;
    height: number;
  };
  variants?: ImageVariant[];
  alt?: string;
  caption?: string;
}

// Image variant (thumbnails, different sizes)
export interface ImageVariant {
  name: string;
  width: number;
  height: number;
  url: string;
  size: number;
}

// Search functionality
export interface SearchRequest {
  query: string;
  filters?: Record<string, unknown>;
  sort?: SortOptions;
  pagination?: PaginationRequest;
  facets?: string[];
  highlight?: boolean;
  fuzzy?: boolean;
}

// Sort options
export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
  mode?: 'min' | 'max' | 'avg';
}

// Pagination request
export interface PaginationRequest {
  page: number;
  limit: number;
  offset?: number;
}

// Search response
export interface SearchResponse<T> {
  hits: SearchHit<T>[];
  total: number;
  maxScore: number;
  facets?: Record<string, FacetResult>;
  suggestions?: string[];
  took: number; // query time in ms
}

// Search hit
export interface SearchHit<T> {
  score: number;
  source: T;
  highlight?: Record<string, string[]>;
  sort?: unknown[];
}

// Facet result
export interface FacetResult {
  buckets: Array<{
    key: string;
    count: number;
  }>;
}

// Cache-related types
export interface CacheEntry<T> {
  key: string;
  value: T;
  ttl: number;
  createdAt: Date;
  accessCount: number;
  lastAccessed: Date;
}

export interface CacheStats {
  hitRate: number;
  missRate: number;
  totalHits: number;
  totalMisses: number;
  totalEntries: number;
  memoryUsage: number;
  evictions: number;
}

// Background job types
export interface BackgroundJob {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  jobId: string;
  type: string;
  payload: Record<string, unknown>;
  status: JobStatus;
  priority: number;
  attempts: number;
  maxAttempts: number;
  progress: number;
  result?: unknown;
  error?: string;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
}

export enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  RETRYING = 'retrying'
}

// Email types
export interface EmailTemplate {
  templateId: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  category: string;
  isActive: boolean;
}

export interface EmailMessage {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  htmlContent?: string;
  textContent?: string;
  attachments?: EmailAttachment[];
  templateId?: string;
  templateData?: Record<string, unknown>;
  scheduledAt?: Date;
  priority: 'low' | 'normal' | 'high';
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType: string;
  disposition?: 'attachment' | 'inline';
  cid?: string; // content id for inline images
}

// Notification types
export interface Notification {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  notificationId: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: Date;
  actionUrl?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  channels: NotificationChannel[];
}

export interface NotificationChannel {
  type: 'email' | 'push' | 'sms' | 'in_app';
  address?: string; // email address, phone number, etc.
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt?: Date;
  deliveredAt?: Date;
  error?: string;
}

// Feature flags
export interface FeatureFlag {
  flagId: string;
  name: string;
  description: string;
  isEnabled: boolean;
  rules?: FeatureFlagRule[];
  variants?: FeatureFlagVariant[];
  rolloutPercentage: number;
  environment: string;
}

export interface FeatureFlagRule {
  condition: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'regex';
  value: unknown;
  enabled: boolean;
}

export interface FeatureFlagVariant {
  name: string;
  value: unknown;
  percentage: number;
}

// A/B Testing
export interface ABTest {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  testId: string;
  name: string;
  description: string;
  hypothesis: string;
  variants: ABTestVariant[];
  trafficAllocation: number;
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate: Date;
  endDate?: Date;
  metrics: string[];
  segments?: string[];
}

export interface ABTestVariant {
  name: string;
  description: string;
  allocation: number;
  config: Record<string, unknown>;
  isControl: boolean;
}
