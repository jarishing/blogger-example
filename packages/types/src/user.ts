/**
 * User-related types for the blogger application
 */

import {
  RecordStatus, UserRole
} from './base';

// Core user interface matching the database schema
export interface User {
  userId: string; // Primary key from database
  recordStatus: RecordStatus;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  username: string;
  hash: string; // Password hash
  bio?: string;
  image?: string;
  role?: UserRole;
  isVerified?: boolean;
  lastLoginAt?: Date;
  preferences?: UserPreferences;
}

// Public user profile (without sensitive data)
export interface PublicUser {
  userId: string;
  username: string;
  bio?: string;
  image?: string;
  role?: UserRole;
  createdAt: Date;
  isVerified?: boolean;
  stats?: UserStats;
}

// User profile for profile pages
export interface UserProfile extends PublicUser {
  following: boolean;
  followersCount: number;
  followingCount: number;
  articlesCount: number;
  joinedAt: Date;
  lastActiveAt?: Date;
  socialLinks?: SocialLinks;
}

// User follow relationship
export interface UserFollow {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  followerId: string;
  followeeId: string;
  notificationsEnabled: boolean;
}

// User preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  emailNotifications: NotificationSettings;
  privacySettings: PrivacySettings;
  editorSettings: EditorSettings;
}

// Notification settings
export interface NotificationSettings {
  newFollowers: boolean;
  newComments: boolean;
  newLikes: boolean;
  articlePublished: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
}

// Privacy settings
export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'followers';
  showEmail: boolean;
  showStats: boolean;
  allowMessages: boolean;
  showOnlineStatus: boolean;
}

// Editor settings
export interface EditorSettings {
  defaultEditor: 'markdown' | 'rich' | 'code';
  autoSave: boolean;
  spellCheck: boolean;
  lineNumbers: boolean;
  wordWrap: boolean;
  theme: string;
}

// Social links
export interface SocialLinks {
  website?: string;
  twitter?: string;
  github?: string;
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
}

// User statistics
export interface UserStats {
  articlesCount: number;
  commentsCount: number;
  likesReceived: number;
  viewsReceived: number;
  followersCount: number;
  followingCount: number;
  joinedDaysAgo: number;
}

// Authentication related types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  marketingOptIn?: boolean;
}

export interface AuthUser extends PublicUser {
  email: string;
  role: UserRole;
  isVerified: boolean;
  permissions: string[];
  preferences: UserPreferences;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
}

// User update types
export interface UpdateUserData {
  email?: string;
  username?: string;
  bio?: string;
  image?: string;
  preferences?: Partial<UserPreferences>;
  socialLinks?: Partial<SocialLinks>;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// User search and filtering
export interface UserSearchParams {
  query?: string;
  role?: UserRole;
  isVerified?: boolean;
  joinedAfter?: Date;
  hasArticles?: boolean;
  location?: string;
  sortBy?: 'username' | 'createdAt' | 'articlesCount' | 'followersCount';
  sortOrder?: 'asc' | 'desc';
}

// Admin user management
export interface AdminUserAction {
  userId: string;
  action: 'ban' | 'unban' | 'verify' | 'unverify' | 'delete' | 'changeRole';
  reason?: string;
  newRole?: UserRole;
  duration?: number; // for temporary bans
}

export interface UserActivity {
  userId: string;
  action: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

// Email verification
export interface EmailVerification {
  email: string;
  token: string;
  expiresAt: Date;
  attempts: number;
}

// Password reset
export interface PasswordReset {
  email: string;
  token: string;
  expiresAt: Date;
  used: boolean;
}
