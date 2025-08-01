/**
 * Core tRPC setup and configuration
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { ZodError } from 'zod';
import type { Context } from './types';

// Initialize tRPC with context
const t = initTRPC.context<Context>().create({
  /**
   * Transform errors to provide consistent error handling
   */
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null
      }
    };
  },
  /**
   * Transform inputs to provide consistent data transformation
   */
  transformer: undefined
});

/**
 * Export reusable router and procedure helpers
 */
export const createTRPCRouter = t.router;
export const { createCallerFactory } = t;

/**
 * Base procedures for different access levels
 */

// Public procedure - no authentication required
export const publicProcedure = t.procedure;

// Protected procedure - requires authentication
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required'
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user // type-safe user
    }
  });
});

// Admin procedure - requires admin role
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required'
    });
  }
  return next({
    ctx
  });
});

// Moderator procedure - requires moderator or admin role
export const moderatorProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!['admin', 'moderator'].includes(ctx.user.role)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Moderator access required'
    });
  }
  return next({
    ctx
  });
});
