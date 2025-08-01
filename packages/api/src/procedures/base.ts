/**
 * Base procedures that can be extended by specific routers
 */

import { publicProcedure } from '../trpc';
import { paginationSchema } from '../schemas';
import { loggingMiddleware, rateLimitMiddleware } from '../middleware';

/**
 * Base procedure with logging
 */
export const baseProcedure = publicProcedure.use(
  loggingMiddleware({
    logLevel: 'info',
    includeInput: false,
    includeOutput: false
  })
);

/**
 * Rate-limited procedure for public endpoints
 */
export const rateLimitedProcedure = baseProcedure.use(
  rateLimitMiddleware({
    windowMs: 60000, // 1 minute
    max: 100 // 100 requests per minute
  })
);

/**
 * Procedure for paginated queries
 */
export const paginatedProcedure = baseProcedure.input(paginationSchema);

/**
 * Procedure for search operations with rate limiting
 */
export const searchProcedure = baseProcedure.use(
  rateLimitMiddleware({
    windowMs: 60000, // 1 minute
    max: 50 // 50 searches per minute
  })
);
