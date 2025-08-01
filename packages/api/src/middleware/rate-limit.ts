/**
 * Rate limiting middleware for tRPC
 */

import { TRPCError } from '@trpc/server';
import type { Context } from '../types';

// Simple in-memory rate limiting store
// In production, this should use Redis or another persistent store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiting middleware for tRPC procedures
 */
export const rateLimitMiddleware = (opts: {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  keyGenerator?: (ctx: Context) => string; // Custom key generator
} = { windowMs: 60000, max: 100 }) => async ({ ctx, next }: { ctx: Context; next: () => Promise<any> }) => {
  const { windowMs, max, keyGenerator } = opts;

  // Generate rate limit key (default: user ID or IP address)
  const key = keyGenerator
    ? keyGenerator(ctx)
    : ctx.user?.userId || ctx.ipAddress || 'anonymous';

  const now = Date.now();
  const resetTime = now + windowMs;

  // Get current rate limit data
  const current = rateLimitStore.get(key);

  if (!current || current.resetTime <= now) {
    // Reset or create new entry
    rateLimitStore.set(key, { count: 1, resetTime });
  } else {
    // Increment count
    current.count += 1;

    if (current.count > max) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Rate limit exceeded. Try again in ${Math.ceil((current.resetTime - now) / 1000)} seconds.`
      });
    }
  }

  return next();
};

/**
 * Strict rate limit for sensitive operations
 */
export const strictRateLimitMiddleware = rateLimitMiddleware({
  windowMs: 60000, // 1 minute
  max: 5 // 5 requests per minute
});

/**
 * Generous rate limit for read operations
 */
export const readRateLimitMiddleware = rateLimitMiddleware({
  windowMs: 60000, // 1 minute
  max: 1000 // 1000 requests per minute
});
