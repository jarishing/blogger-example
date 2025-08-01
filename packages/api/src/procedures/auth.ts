/**
 * Authentication-related procedures
 */

import { protectedProcedure } from '../trpc';
import { strictRateLimitMiddleware, loggingMiddleware } from '../middleware';

/**
 * Procedure for sensitive authentication operations
 */
export const sensitiveAuthProcedure = protectedProcedure
  .use(strictRateLimitMiddleware)
  .use(loggingMiddleware({
    logLevel: 'warn',
    includeInput: false,
    includeOutput: false
  }));

/**
 * Procedure for user profile operations
 */
export const profileProcedure = protectedProcedure.use(
  loggingMiddleware({
    logLevel: 'info',
    includeInput: false,
    includeOutput: false
  })
);
