/**
 * Logging middleware for tRPC
 */

import type { Context } from '../types';

/**
 * Logging middleware that logs all tRPC procedure calls
 */
export const loggingMiddleware = (opts: {
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  includeInput?: boolean;
  includeOutput?: boolean;
} = {}) => async ({
  ctx, next, path, type, input
}: {
  ctx: Context;
  next: () => Promise<any>;
  path: string;
  type: string;
  input: any;
}) => {
  const { logLevel = 'info', includeInput = false, includeOutput = false } = opts;

  const startTime = Date.now();
  const logData: any = {
    trpc: {
      path,
      type,
      userId: ctx.user?.userId,
      sessionId: ctx.sessionId,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent
    }
  };

  if (includeInput) {
    logData.input = input;
  }

  try {
    const result = await next();

    const duration = Date.now() - startTime;
    logData.duration = duration;
    logData.success = true;

    if (includeOutput) {
      logData.output = result;
    }

    // In a real implementation, you would use a proper logger here
    // For now, we'll just use console.log
    console.log(`[${logLevel.toUpperCase()}] tRPC ${type} ${path}`, logData);

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logData.duration = duration;
    logData.success = false;
    logData.error = {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any).code || 'UNKNOWN'
    };

    console.error(`[ERROR] tRPC ${type} ${path}`, logData);

    throw error;
  }
};

/**
 * Debug logging middleware with full input/output logging
 */
export const debugLoggingMiddleware = loggingMiddleware({
  logLevel: 'debug',
  includeInput: true,
  includeOutput: true
});

/**
 * Production logging middleware with minimal logging
 */
export const productionLoggingMiddleware = loggingMiddleware({
  logLevel: 'info',
  includeInput: false,
  includeOutput: false
});
