/**
 * @blogger/types - Shared TypeScript types for the Modern Blogger application
 *
 * This package provides comprehensive type definitions for all aspects of the blogger platform,
 * including users, articles, authentication, API responses, and more.
 *
 * @version 0.0.0
 * @author Blogger Team
 */

// Base types and common interfaces
export type {
  BaseEntity,
  EntityWithStatus,
  RecordStatus,
  PaginationParams,
  PaginatedResponse,
  SortParams,
  FilterParams,
  Optional,
  RequiredFields,
  DeepPartial,
  RelationOptions,
  ContentType,
  UserRole,
  PublicationStatus
} from './base';

// User-related types
export * from './user';

// Article and content types
export * from './article';

// Authentication and authorization types (with explicit re-exports to avoid conflicts)
export type {
  JWTPayload,
  AuthResponse,
  TokenPair,
  SessionInfo,
  LoginRequest,
  RegisterRequest,
  PasswordResetRequest,
  PasswordResetConfirm,
  EmailVerificationRequest,
  RefreshTokenRequest,
  LogoutRequest,
  ChangePasswordRequest,
  TwoFactorSetup,
  TwoFactorVerify,
  TwoFactorBackupCode,
  Permission,
  RolePermission,
  SecurityEvent,
  SecurityEventType,
  ApiKey,
  CreateApiKeyRequest,
  OAuthProvider,
  OAuthConnection,
  AccountVerification,
  LoginAttempt,
  AccountLockout,
  AuthContext,
  AuthErrorCode
} from './auth';

// API and utility types (with explicit re-exports to avoid conflicts)
export type {
  ApiResponse,
  ResponseMeta,
  PaginationMeta,
  ApiError,
  ErrorDetails,
  ValidationError,
  HealthCheckResponse,
  ServiceHealth,
  HealthMetrics,
  AnalyticsEvent,
  EventMetadata,
  WebhookEvent,
  WebhookSubscription,
  RetryPolicy,
  FileUpload,
  ImageUpload,
  ImageVariant,
  SearchRequest,
  SortOptions,
  PaginationRequest,
  SearchResponse,
  SearchHit,
  FacetResult,
  CacheEntry,
  CacheStats,
  BackgroundJob,
  JobStatus,
  EmailTemplate,
  EmailMessage,
  EmailAttachment,
  Notification,
  NotificationChannel,
  FeatureFlag,
  FeatureFlagRule,
  FeatureFlagVariant,
  ABTest,
  ABTestVariant
} from './api';

// Resolve naming conflicts by aliasing
export type {
  DeviceInfo as AuthDeviceInfo,
  LocationInfo as AuthLocationInfo,
  RateLimitInfo as AuthRateLimitInfo
} from './auth';

export type {
  DeviceInfo as ApiDeviceInfo,
  LocationInfo as ApiLocationInfo,
  RateLimitInfo as ApiRateLimitInfo,
  UTMParameters
} from './api';
