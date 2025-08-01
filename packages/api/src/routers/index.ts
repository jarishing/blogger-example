/**
 * Main router that combines all feature routers
 */

import { createTRPCRouter } from '../trpc';
import { authRouter } from './auth';
import { articlesRouter } from './articles';
import { usersRouter } from './users';

/**
 * Main API router
 * This is the primary router that exposes all API functionality
 *
 * Router structure:
 * - auth.*: Authentication and authorization
 * - articles.*: Article management, comments, favorites
 * - users.*: User profiles, settings, following
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  articles: articlesRouter,
  users: usersRouter
});

// Export the type definition for the API
export type AppRouter = typeof appRouter;
