/**
 * Authentication and authorization validation schemas
 */

import { z } from 'zod';

// Email validation
const emailSchema = z.string().email().max(255);

// Password validation with security requirements
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Username validation
const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens');

// Login request
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
  captchaToken: z.string().optional()
});

// Registration request
export const registerSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine((val) => val === true, 'You must agree to the terms'),
  marketingOptIn: z.boolean().optional(),
  inviteCode: z.string().optional(),
  captchaToken: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

// Password reset request
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
  captchaToken: z.string().optional()
});

// Password reset confirmation
export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

// Change password
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

// Email verification
export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required')
});

// Refresh token
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
  deviceId: z.string().optional()
});

// Logout
export const logoutSchema = z.object({
  refreshToken: z.string().optional(),
  allDevices: z.boolean().default(false)
});

// Two-factor authentication
export const twoFactorVerifySchema = z.object({
  token: z.string().min(1, 'Token is required'),
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Code must be numeric')
});

// API key creation
export const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(z.string()).min(1),
  allowedIPs: z.array(z.string().ip()).optional(),
  expiresAt: z.date().optional()
});

// Session management
export const sessionSchema = z.object({
  sessionId: z.string().min(1)
});

export const revokeSessionSchema = z.object({
  sessionId: z.string().min(1)
});

export const revokeAllSessionsSchema = z.object({
  exceptCurrent: z.boolean().default(true)
});
