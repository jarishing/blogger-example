# 🎯 Option C: Hybrid Approach (API Gateway) Example

## How It Works
**Think of it like a "Shopping Mall with a Reception Desk"**

The reception desk (API Gateway) receives all requests and directs you to the right store (microservice).

## Architecture
```
Frontend → packages/api (Gateway) → apps/article (Service)
                ↓
          apps/user (Service)
                ↓  
          apps/auth (Service)
```

## File Structure
```
packages/api/          # 🚪 API Gateway (Reception Desk)
├── routers/
│   ├── articles.ts   # Routes requests to Article Service
│   ├── users.ts      # Routes requests to User Service
│   └── auth.ts       # Routes requests to Auth Service
└── server.ts         # Gateway server (Port 3000)

apps/article/         # 📰 Article Service (Specialized Store)
├── controllers/
├── services/  
└── server.ts         # Article server (Port 3001)

apps/user/            # 👤 User Service (Specialized Store)
├── controllers/
├── services/
└── server.ts         # User server (Port 3002)
```

## Example Implementation

### 1. API Gateway (packages/api/src/routers/articles.ts)
```typescript
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { createArticleSchema } from '../schemas';

export const articlesRouter = createTRPCRouter({
  // Gateway receives request and forwards to Article Service
  create: protectedProcedure
    .input(createArticleSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Forward request to Article Service
        const response = await fetch('http://localhost:3001/api/articles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ctx.user.token}`,
            'User-ID': ctx.user.userId
          },
          body: JSON.stringify(input)
        });

        if (!response.ok) {
          throw new Error(`Article service error: ${response.statusText}`);
        }

        const result = await response.json();
        return result.data;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create article'
        });
      }
    }),

  getAll: publicProcedure
    .query(async () => {
      // Forward request to Article Service
      const response = await fetch('http://localhost:3001/api/articles');
      const result = await response.json();
      return result.data;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // Forward request to Article Service  
      const response = await fetch(`http://localhost:3001/api/articles/${input.id}`);
      const result = await response.json();
      return result.data;
    })
});
```

### 2. Gateway Server (packages/api/src/server.ts)
```typescript
import { fastify } from 'fastify';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { appRouter } from './routers';

const server = fastify();

// Register tRPC
server.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: {
    router: appRouter,
    createContext: createTRPCContext
  }
});

// Gateway runs on port 3000
server.listen({ port: 3000 }, () => {
  console.log('API Gateway running on port 3000');
});
```

### 3. Article Service (apps/article/server.ts)
```typescript
import fastify from 'fastify';
import { articleRoutes } from './routes';

const server = fastify();

// CORS for gateway requests
server.register(require('@fastify/cors'), {
  origin: ['http://localhost:3000'], // Allow gateway
});

server.register(articleRoutes, { prefix: '/api/articles' });

// Article service runs on port 3001
server.listen({ port: 3001 }, () => {
  console.log('Article Service running on port 3001');
});
```

### 4. Article Service Controller (apps/article/controllers/createArticle.ts)
```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import { ArticleService } from '../services/ArticleService';

interface CreateArticleRequest {
  Body: {
    title: string;
    description: string;
    body: string;
    tags?: string[];
  };
  Headers: {
    'user-id': string;
    authorization: string;
  };
}

export async function createArticleController(
  request: FastifyRequest<CreateArticleRequest>,
  reply: FastifyReply
) {
  try {
    const articleData = request.body;
    const userId = request.headers['user-id'];

    // Business logic in service
    const article = await ArticleService.create(articleData, userId);

    reply.code(201).send({
      success: true,
      data: article
    });
  } catch (error) {
    reply.code(500).send({
      success: false,
      error: error.message
    });
  }
}
```

## How Frontend Uses It

```typescript
// Frontend ONLY talks to the Gateway
import { trpc } from './lib/trpc';

function ArticleForm() {
  const createArticle = trpc.articles.create.useMutation();
  
  const handleSubmit = async (data) => {
    // This goes to Gateway (port 3000)
    // Gateway forwards to Article Service (port 3001)
    const result = await createArticle.mutateAsync(data);
    console.log('Article created:', result);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

## Request Flow Example

```
1. Frontend → POST /trpc/articles.create
   ↓
2. Gateway (port 3000) → receives tRPC request
   ↓  
3. Gateway → POST http://localhost:3001/api/articles
   ↓
4. Article Service (port 3001) → processes request
   ↓
5. Article Service → returns response to Gateway
   ↓
6. Gateway → returns tRPC response to Frontend
```

## Service-to-Service Communication

Sometimes services need to talk to each other:

```typescript
// In Article Service - need to get user info
export class ArticleService {
  static async create(data: CreateArticleData, userId: string) {
    // Get user info from User Service
    const userResponse = await fetch(`http://localhost:3002/api/users/${userId}`);
    const user = await userResponse.json();
    
    if (!user.data) {
      throw new Error('User not found');
    }

    // Create article with user info
    const article = await db.insert(articles).values({
      ...data,
      userId,
      authorName: user.data.username
    });

    return article;
  }
}
```

## Pros and Cons

### ✅ Pros
- **Single entry point**: Frontend only talks to one place (Gateway)
- **Service independence**: Each service can be developed separately
- **Load balancing**: Gateway can distribute requests
- **Authentication**: Handle auth once in gateway
- **Type safety**: Keep tRPC benefits

### ❌ Cons
- **Double network calls**: Gateway → Service adds latency
- **More complexity**: Need to manage multiple services
- **Error handling**: Need to handle service failures
- **Data consistency**: Harder to maintain across services

## When to Use Each Approach

### Use Current Approach (packages/api) when:
- 👥 Small team (1-5 developers)
- 🏠 Simple application
- 🚀 Quick development needed
- 📱 Prototype or MVP

### Use Microservices (Option B) when:
- 👥 Large team (10+ developers)
- 🏢 Enterprise application
- 🔄 Different teams own different features
- 🌍 Global scale application

### Use Hybrid (Option C) when:
- 👥 Medium team (5-10 developers)
- 🎯 Want benefits of both approaches
- 🔧 Need gradual migration to microservices
- 📊 Complex business logic per domain