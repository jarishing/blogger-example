/**
 * @conduit/api - tRPC API package
 *
 * This package provides the complete tRPC API implementation for the Conduit application.
 * It includes routers, procedures, middleware, validation schemas, and type definitions.
 */

// Core tRPC exports
// Re-export appRouter and other exports for default export
import { appRouter } from './routers';
import { createTRPCContext } from './context';
import { createTRPCRouter, createCallerFactory } from './trpc';

export {
  createTRPCRouter,
  createCallerFactory,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
  moderatorProcedure
} from './trpc';

// Main router and types
export { appRouter, type AppRouter } from './routers';

// Context creation
export { createTRPCContext, createTestContext } from './context';

// Type definitions
export type {
  Context, CreateContextOptions, ApiResponse, PaginatedResponse
} from './types';

// Individual routers for modular usage
export { authRouter } from './routers/auth';
export { articlesRouter } from './routers/articles';
export { usersRouter } from './routers/users';

// Validation schemas
export * from './schemas';

// Middleware
export * from './middleware';

// Procedures
export * from './procedures';

/**
 * Default export for convenience
 */
export default {
  appRouter,
  createTRPCContext,
  createTRPCRouter,
  createCallerFactory
} as const;
