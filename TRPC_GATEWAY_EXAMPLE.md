# 🚪 tRPC as API Gateway - Complete Example

## Architecture Overview
```
Frontend (tRPC Client) → packages/api (tRPC Gateway) → Multiple Backend Services
```

## Benefits
- ✅ **Type safety** from frontend to gateway
- ✅ **Single entry point** for frontend developers  
- ✅ **Service aggregation** - combine multiple services in one response
- ✅ **Authentication** handled once in gateway
- ✅ **Rate limiting** applied consistently
- ✅ **Error handling** standardized

## Implementation

### 1. tRPC Gateway (packages/api/src/routers/articles.ts)

```typescript
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { createArticleSchema, getArticleSchema } from '../schemas';
import { TRPCError } from '@trpc/server';

// Service URLs (could be from environment variables)
const ARTICLE_SERVICE_URL = process.env.ARTICLE_SERVICE_URL || 'http://localhost:3001';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002';

export const articlesRouter = createTRPCRouter({
  /**
   * Create Article - Gateway orchestrates multiple services
   */
  create: protectedProcedure
    .input(createArticleSchema)
    .mutation(async ({ input, ctx }): Promise<PublicArticle> => {
      try {
        // 1. Create article in Article Service
        const articleResponse = await fetch(`${ARTICLE_SERVICE_URL}/api/articles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ctx.user?.token}`,
            'X-User-ID': ctx.user?.userId || '',
          },
          body: JSON.stringify(input)
        });

        if (!articleResponse.ok) {
          throw new Error(`Article service error: ${articleResponse.statusText}`);
        }

        const articleData = await articleResponse.json();

        // 2. Get user profile from User Service (for author info)
        const userResponse = await fetch(`${USER_SERVICE_URL}/api/users/${ctx.user?.userId}`, {
          headers: {
            'Authorization': `Bearer ${ctx.user?.token}`,
          }
        });

        if (!userResponse.ok) {
          throw new Error(`User service error: ${userResponse.statusText}`);
        }

        const userData = await userResponse.json();

        // 3. Combine data from multiple services
        return {
          ...articleData.data,
          author: {
            userId: userData.data.userId,
            username: userData.data.username,
            bio: userData.data.bio,
            image: userData.data.image
          },
          // Gateway can add computed fields
          readingTime: calculateReadingTime(articleData.data.body),
          isFavorited: false, // Could check favorites service
          favoritesCount: 0
        };

      } catch (error) {
        console.error('Gateway error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create article'
        });
      }
    }),

  /**
   * Get Article - Aggregates data from multiple services
   */
  getById: publicProcedure
    .input(getArticleSchema)
    .query(async ({ input, ctx }): Promise<PublicArticle> => {
      try {
        // Parallel requests to multiple services
        const [articleResponse, commentsResponse] = await Promise.all([
          // Get article from Article Service
          fetch(`${ARTICLE_SERVICE_URL}/api/articles/${input.articleId}`),
          
          // Get comments count from Article Service
          fetch(`${ARTICLE_SERVICE_URL}/api/articles/${input.articleId}/comments/count`)
        ]);

        if (!articleResponse.ok) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Article not found'
          });
        }

        const articleData = await articleResponse.json();
        const commentsData = await commentsResponse.json();

        // Get author info from User Service
        const userResponse = await fetch(`${USER_SERVICE_URL}/api/users/${articleData.data.userId}`);
        const userData = await userResponse.json();

        // Check if current user favorited this article (if authenticated)
        let isFavorited = false;
        if (ctx.user) {
          const favoriteResponse = await fetch(
            `${ARTICLE_SERVICE_URL}/api/articles/${input.articleId}/favorite/check?userId=${ctx.user.userId}`
          );
          const favoriteData = await favoriteResponse.json();
          isFavorited = favoriteData.isFavorited;
        }

        // Gateway aggregates all the data
        return {
          ...articleData.data,
          author: userData.data,
          commentsCount: commentsData.count,
          isFavorited,
          canEdit: ctx.user?.userId === articleData.data.userId
        };

      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get article'
        });
      }
    }),

  /**
   * Get Articles Feed - Complex aggregation example
   */
  getFeed: protectedProcedure
    .query(async ({ ctx }): Promise<PublicArticle[]> => {
      try {
        // 1. Get user's following list from User Service
        const followingResponse = await fetch(
          `${USER_SERVICE_URL}/api/users/${ctx.user?.userId}/following`,
          {
            headers: { 'Authorization': `Bearer ${ctx.user?.token}` }
          }
        );
        const followingData = await followingResponse.json();
        const followingIds = followingData.data.map((f: any) => f.userId);

        // 2. Get articles from followed users from Article Service
        const articlesResponse = await fetch(
          `${ARTICLE_SERVICE_URL}/api/articles/feed`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${ctx.user?.token}`
            },
            body: JSON.stringify({ authorIds: followingIds })
          }
        );
        const articlesData = await articlesResponse.json();

        // 3. Enhance articles with author info and user-specific data
        const enhancedArticles = await Promise.all(
          articlesData.data.map(async (article: any) => {
            // Get author info
            const authorResponse = await fetch(`${USER_SERVICE_URL}/api/users/${article.userId}`);
            const authorData = await authorResponse.json();

            // Check if user favorited this article
            const favoriteResponse = await fetch(
              `${ARTICLE_SERVICE_URL}/api/articles/${article.articleId}/favorite/check?userId=${ctx.user?.userId}`
            );
            const favoriteData = await favoriteResponse.json();

            return {
              ...article,
              author: authorData.data,
              isFavorited: favoriteData.isFavorited,
              canEdit: ctx.user?.userId === article.userId
            };
          })
        );

        return enhancedArticles;

      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get feed'
        });
      }
    })
});

// Helper function
function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}
```

### 2. Article Microservice (apps/article/server.ts)

```typescript
import fastify from 'fastify';
import { articleRoutes } from './routes';

const server = fastify({
  logger: true
});

// CORS for gateway requests
server.register(require('@fastify/cors'), {
  origin: [process.env.GATEWAY_URL || 'http://localhost:3000']
});

// Health check
server.get('/health', async () => {
  return { status: 'ok', service: 'article' };
});

// Register routes
server.register(articleRoutes, { prefix: '/api/articles' });

const start = async () => {
  try {
    await server.listen({ 
      port: parseInt(process.env.PORT || '3001'),
      host: '0.0.0.0'
    });
    console.log('Article Service running on port 3001');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
```

### 3. Article Service Controller (apps/article/controllers/createArticle.ts)

```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import { ArticleService } from '../services/ArticleService';
import { CreateArticleSchema } from '../schemas/createArticle';

interface CreateArticleRequest {
  Body: CreateArticleSchema;
  Headers: {
    'authorization': string;
    'x-user-id': string;
  };
}

export async function createArticleController(
  request: FastifyRequest<CreateArticleRequest>,
  reply: FastifyReply
) {
  try {
    const articleData = request.body;
    const userId = request.headers['x-user-id'];

    if (!userId) {
      return reply.code(401).send({
        success: false,
        error: 'User ID header required'
      });
    }

    // Pure business logic - no gateway concerns
    const article = await ArticleService.create({
      ...articleData,
      userId,
      slug: generateSlug(articleData.title),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    reply.code(201).send({
      success: true,
      data: article
    });

  } catch (error) {
    request.log.error('Error creating article:', error);
    reply.code(500).send({
      success: false,
      error: 'Failed to create article'
    });
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}
```

### 4. Frontend Usage (Same as before!)

```typescript
// Frontend code stays exactly the same!
import { trpc } from './lib/trpc';

function CreateArticle() {
  const createArticle = trpc.articles.create.useMutation();
  
  const handleSubmit = async (data: CreateArticleData) => {
    try {
      // Gateway handles all the complexity
      const article = await createArticle.mutateAsync(data);
      console.log('Article created:', article);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

## Service Communication Patterns

### 1. Sequential Calls (when data depends on previous calls)
```typescript
// Get article, then get author, then get comments
const article = await getArticle(id);
const author = await getUser(article.userId);
const comments = await getComments(id);
```

### 2. Parallel Calls (when data is independent)
```typescript
// Get all data simultaneously
const [article, comments, favorites] = await Promise.all([
  getArticle(id),
  getComments(id),
  getFavorites(id)
]);
```

### 3. Error Handling
```typescript
try {
  const article = await getArticle(id);
  return article;
} catch (error) {
  if (error.code === 'SERVICE_UNAVAILABLE') {
    // Return cached data or default
    return getCachedArticle(id);
  }
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Article service temporarily unavailable'
  });
}
```

## Deployment Example

### Docker Compose
```yaml
version: '3.8'
services:
  gateway:
    build: ./packages/api
    ports:
      - "3000:3000"
    environment:
      - ARTICLE_SERVICE_URL=http://article-service:3001
      - USER_SERVICE_URL=http://user-service:3002
    depends_on:
      - article-service
      - user-service

  article-service:
    build: ./apps/article
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://...

  user-service:
    build: ./apps/user
    ports:
      - "3002:3002"
    environment:
      - DATABASE_URL=postgresql://...
```

## Pros and Cons

### ✅ Pros
- **Type safety** from frontend to gateway
- **Single API** for frontend developers
- **Service aggregation** - combine multiple services
- **Centralized auth** and rate limiting
- **Easy to add caching**
- **Gradual migration** from monolith

### ❌ Cons
- **Network overhead** - multiple service calls
- **Complex error handling** 
- **Service dependencies** - if one service is down, gateway fails
- **Debugging complexity** - errors can happen in multiple places
- **Data consistency** - harder to maintain across services

## When to Use tRPC Gateway

### ✅ Use when:
- Large team (10+ developers)
- Multiple domain services
- Need to aggregate data from multiple sources
- Legacy services to integrate
- Different teams own different services
- Need centralized authentication/authorization

### ❌ Don't use when:
- Small team (< 5 developers)
- Simple application
- All data is in one database
- Learning/prototyping
- Performance is critical (avoid network overhead)