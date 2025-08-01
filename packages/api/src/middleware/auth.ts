/**
 * Authentication middleware for tRPC
 */

import { TRPCError } from '@trpc/server';
import type { Context } from '../types';

/**
 * Authentication middleware that can be used with tRPC procedures
 * This middleware checks if a user is authenticated and has the required permissions
 */
export const authMiddleware = (opts: { requireAuth?: boolean; roles?: string[] } = {}) => async ({ ctx, next }: { ctx: Context; next: () => Promise<any> }) => {
  const { requireAuth = true, roles = [] } = opts;

  // If authentication is required but no user is present
  if (requireAuth && !ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required'
    });
  }

  // If specific roles are required
  if (roles.length > 0 && ctx.user) {
    if (!roles.includes(ctx.user.role)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Required role: ${roles.join(' or ')}`
      });
    }
  }

  return next();
};

/**
 * Optional auth middleware - doesn't throw if user is not authenticated
 */
export const optionalAuthMiddleware = authMiddleware({ requireAuth: false });

/**
 * Admin-only middleware
 */
export const adminMiddleware = authMiddleware({ roles: ['admin'] });

/**
 * Moderator or admin middleware
 */
export const moderatorMiddleware = authMiddleware({ roles: ['admin', 'moderator'] });
