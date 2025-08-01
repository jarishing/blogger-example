/**
 * tRPC context creation and management
 */

// Database and Types integration
import type { User } from '@conduit/types';
import type { Context, CreateContextOptions } from './types';

/**
 * Create context for tRPC procedures
 * This function is called for every request and provides the context
 * that will be available in all procedures
 */
export const createTRPCContext = async (opts: CreateContextOptions): Promise<Context> => {
  const { req, res } = opts;

  // Extract user from request (set by auth middleware)
  const user = (req as any).user as User | undefined;
  const sessionId = (req as any).sessionId as string | undefined;

  // Extract additional request information
  const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';

  return {
    req,
    res,
    user,
    sessionId,
    ipAddress,
    userAgent
  };
};

/**
 * Create context for testing purposes
 */
export const createTestContext = (overrides: Partial<Context> = {}): Context => {
  const mockReq = {
    ip: '127.0.0.1',
    connection: { remoteAddress: '127.0.0.1' },
    get: () => 'test-user-agent'
  };

  const mockRes = {};

  return {
    req: mockReq,
    res: mockRes,
    ipAddress: '127.0.0.1',
    userAgent: 'test-user-agent',
    ...overrides
  };
};
