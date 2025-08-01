# 🔗 Package Integration Guide

## Overview

This guide explains how the `@conduit/api`, `@conduit/database`, and `@conduit/types` packages work together to provide a robust, type-safe API architecture.

## Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   @conduit/api  │    │@conduit/database│    │ @conduit/types  │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ tRPC        │ │───▶│ │ Drizzle ORM │ │    │ │ TypeScript  │ │
│ │ Routers     │ │    │ │ Schemas     │ │◄───┤ │ Interfaces  │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Procedures  │ │    │ │ Connection  │ │    │ │ Validation  │ │
│ │ & Middleware│ │    │ │ Management  │ │    │ │ Schemas     │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                               │
                    ┌─────────────────┐
                    │   Applications  │
                    │ (Frontend/API)  │
                    └─────────────────┘
```

## Package Dependencies

### @conduit/api Dependencies
```json
{
  "dependencies": {
    "@conduit/auth": "*",
    "@conduit/database": "*",
    "@conduit/types": "*",
    "@trpc/server": "^10.45.0",
    "zod": "^3.22.4"
  }
}
```

### @conduit/database Dependencies
```json
{
  "dependencies": {
    "drizzle-orm": "^0.29.3",
    "drizzle-zod": "^0.5.1",
    "pg": "^8.16.3",
    "postgres": "^3.4.3",
    "zod": "^3.22.4"
  }
}
```

### @conduit/types Dependencies
```json
{
  "dependencies": {
    // No runtime dependencies - pure TypeScript types
  }
}
```

## Integration Examples

### 1. Database Integration

```typescript
// packages/api/src/routers/articles.ts
import { eq, desc, ilike, and, or, count } from 'drizzle-orm';

// Database imports
import { db, articles, comments, articleFavorites, users } from '@conduit/database';

// Example database operation
const [newArticle] = await db
  .insert(articles)
  .values({
    articleId,
    title,
    slug,
    description,
    body,
    userId: ctx.user.userId,
    recordStatus: 'active'
  })
  .returning();
```

### 2. Types Integration

```typescript
// packages/api/src/routers/articles.ts
import type { 
  Article, 
  PublicArticle, 
  Comment,
  PublicUser 
} from '@conduit/types';

// Example typed procedure
create: protectedProcedure
  .input(createArticleSchema)
  .mutation(async ({ input, ctx }): Promise<PublicArticle> => {
    // Implementation returns properly typed data
    return {
      ...newArticle,
      author: author as PublicUser,
      isFavorited: false,
      favoritesCount: 0,
      // ... other required fields
    } as PublicArticle;
  })
```

### 3. Context Integration

```typescript
// packages/api/src/context.ts
import type { User } from '@conduit/types';
import type { Context, CreateContextOptions } from './types';

export const createTRPCContext = async (opts: CreateContextOptions): Promise<Context> => {
  const { req, res } = opts;
  
  // Extract authenticated user (type-safe)
  const user = (req as any).user as User | undefined;
  
  return {
    req,
    res,
    user, // Type-safe User from @conduit/types
    sessionId,
    ipAddress,
    userAgent
  };
};
```

## Data Flow

### 1. Request Flow
```
1. Request → API Layer (@conduit/api)
2. tRPC Router validates input with Zod schemas
3. Middleware applies authentication/authorization  
4. Procedure executes business logic
5. Database operations via Drizzle (@conduit/database)
6. Response formatted with TypeScript types (@conduit/types)
```

### 2. Type Safety Flow
```
Database Schema → TypeScript Types → tRPC Procedures → Client Types
    (Drizzle)      (@conduit/types)     (@conduit/api)    (Frontend)
```

## Key Integration Points

### 1. Shared Types
- User types from `@conduit/types`
- Article types from `@conduit/types`
- API response types from `@conduit/types`

### 2. Database Operations
- Drizzle ORM queries from `@conduit/database`
- Schema definitions from `@conduit/database`
- Connection management from `@conduit/database`

### 3. Validation
- Input validation using Zod schemas
- Type inference from database schemas
- Runtime type checking in procedures

## Best Practices

### 1. Type Consistency
```typescript
// ✅ Good: Use shared types from @conduit/types
import type { User, Article } from '@conduit/types';

// ❌ Bad: Define duplicate types in API package
interface LocalUser { ... }
```

### 2. Database Operations
```typescript
// ✅ Good: Use Drizzle queries from @conduit/database
import { db, articles } from '@conduit/database';
const article = await db.select().from(articles).where(eq(articles.id, id));

// ❌ Bad: Raw SQL or duplicate schema definitions
const article = await db.query('SELECT * FROM articles WHERE id = $1', [id]);
```

### 3. Error Handling
```typescript
// ✅ Good: Proper error handling with types
try {
  const result = await db.insert(articles).values(data).returning();
  return result[0] as PublicArticle;
} catch (error) {
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Failed to create article'
  });
}
```

## Migration Path

If you need to implement the full integration:

1. **Update existing procedures** to use database operations
2. **Replace placeholder implementations** with real logic
3. **Add proper error handling** for database operations
4. **Implement pagination** using shared utilities
5. **Add caching layers** where appropriate
6. **Write comprehensive tests** for all integrations

## Testing Integration

```typescript
// Example test setup
import { createTestContext } from '@conduit/api';
import { db } from '@conduit/database';
import type { User } from '@conduit/types';

describe('Articles API', () => {
  it('should create article with proper types', async () => {
    const mockUser: User = { /* mock user data */ };
    const ctx = createTestContext({ user: mockUser });
    
    const result = await articlesRouter.create({
      input: { title: 'Test', description: 'Test', body: 'Test' },
      ctx
    });
    
    expect(result).toMatchObject({
      title: 'Test',
      author: expect.objectContaining({
        userId: mockUser.userId
      })
    });
  });
});
```

This integration ensures:
- **Type Safety**: End-to-end TypeScript types
- **Code Reuse**: Shared schemas and utilities
- **Maintainability**: Single source of truth for types
- **Performance**: Optimized database queries
- **Scalability**: Modular architecture that grows with your needs