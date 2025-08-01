/**
 * Authentication and authorization types
 */

import { UserRole } from './base';
import { AuthUser } from './user';

// JWT Token payload
export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  role: UserRole;
  permissions: string[];
  iat: number; // issued at
  exp: number; // expires at
  jti: string; // JWT ID
  tokenType: 'access' | 'refresh';
}

// Authentication response
export interface AuthResponse {
  user: AuthUser;
  tokens: TokenPair;
  session: SessionInfo;
}

// Token pair (access + refresh)
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
  tokenType: 'Bearer';
}

// Session information
export interface SessionInfo {
  sessionId: string;
  userId: string;
  deviceId?: string;
  deviceName?: string;
  userAgent?: string;
  ipAddress: string;
  location?: LocationInfo;
  createdAt: Date;
  lastAccessedAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

// Location information from IP
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

// Login request data
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceInfo?: DeviceInfo;
  captchaToken?: string;
}

// Device information
export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  fingerprint?: string;
}

// Registration request data
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  marketingOptIn?: boolean;
  inviteCode?: string;
  captchaToken?: string;
}

// Password reset request
export interface PasswordResetRequest {
  email: string;
  captchaToken?: string;
}

// Password reset confirmation
export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// Email verification
export interface EmailVerificationRequest {
  token: string;
}

// Refresh token request
export interface RefreshTokenRequest {
  refreshToken: string;
  deviceId?: string;
}

// Logout request
export interface LogoutRequest {
  refreshToken?: string;
  allDevices?: boolean;
}

// Change password request
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Two-factor authentication
export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface TwoFactorVerify {
  token: string;
  code: string;
}

export interface TwoFactorBackupCode {
  userId: string;
  code: string;
  used: boolean;
  usedAt?: Date;
}

// Permission system
export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  resource: string;
  action: string;
}

export interface RolePermission {
  role: UserRole;
  permissions: string[];
}

// Security events
export interface SecurityEvent {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  eventId: string;
  userId: string;
  eventType: SecurityEventType;
  details: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress: string;
  userAgent?: string;
  location?: LocationInfo;
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export enum SecurityEventType {
  LOGIN = 'login',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  PASSWORD_CHANGED = 'password_changed',
  EMAIL_CHANGED = 'email_changed',
  ACCOUNT_LOCKED = 'account_locked',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  TOKEN_REFRESH = 'token_refresh',
  TOKEN_REVOKED = 'token_revoked',
  TWO_FACTOR_ENABLED = 'two_factor_enabled',
  TWO_FACTOR_DISABLED = 'two_factor_disabled',
  PERMISSION_CHANGED = 'permission_changed'
}

// Rate limiting
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}

// API Key management
export interface ApiKey {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  keyId: string;
  userId: string;
  name: string;
  key: string; // hashed
  permissions: string[];
  allowedIPs?: string[];
  lastUsedAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
  usageCount: number;
}

export interface CreateApiKeyRequest {
  name: string;
  permissions: string[];
  allowedIPs?: string[];
  expiresAt?: Date;
}

// OAuth integration
export interface OAuthProvider {
  provider: 'google' | 'github' | 'twitter' | 'facebook' | 'linkedin';
  clientId: string;
  scope: string[];
  redirectUri: string;
}

export interface OAuthConnection {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  provider: string;
  providerId: string;
  email?: string;
  username?: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  isActive: boolean;
}

// Account verification
export interface AccountVerification {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  verificationType: 'email' | 'phone' | 'identity';
  token: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
  isCompleted: boolean;
  completedAt?: Date;
}

// Login attempt tracking
export interface LoginAttempt {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  ipAddress: string;
  userAgent?: string;
  success: boolean;
  failureReason?: string;
  location?: LocationInfo;
  blocked: boolean;
}

// Account lockout
export interface AccountLockout {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  reason: string;
  lockedBy?: string; // admin who locked the account
  lockedUntil?: Date; // null for permanent lock
  attempts: number;
  isActive: boolean;
  releasedAt?: Date;
  releasedBy?: string;
}

// Authentication middleware context
export interface AuthContext {
  user: AuthUser;
  session: SessionInfo;
  permissions: string[];
  isAuthenticated: boolean;
  canAccess: (resource: string, action: string) => boolean;
}

// Error types for authentication
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_NOT_VERIFIED = 'ACCOUNT_NOT_VERIFIED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  RATE_LIMITED = 'RATE_LIMITED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  TWO_FACTOR_REQUIRED = 'TWO_FACTOR_REQUIRED',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  USERNAME_ALREADY_EXISTS = 'USERNAME_ALREADY_EXISTS',
  INVALID_VERIFICATION_TOKEN = 'INVALID_VERIFICATION_TOKEN'
}
