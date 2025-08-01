# 🏢 Option B: Microservices Example

## File Structure
```
apps/
├── article/           # 📰 ONLY handles articles
│   ├── controllers/   # Handle HTTP requests
│   ├── services/      # Business logic
│   ├── server.ts      # Own server (Port 3001)
│   └── package.json   # Own dependencies
├── user/             # 👤 ONLY handles users  
│   ├── controllers/
│   ├── services/
│   ├── server.ts     # Own server (Port 3002)
│   └── package.json
└── auth/             # 🔐 ONLY handles authentication
    ├── controllers/
    ├── services/
    ├── server.ts     # Own server (Port 3003)
    └── package.json
```

## Example: Article Service (apps/article)

### 1. Server Setup (apps/article/server.ts)
```typescript
import fastify from 'fastify';
import { articleRoutes } from './routes';

const server = fastify();

// Register article routes
server.register(articleRoutes, { prefix: '/api/articles' });

// Start server on port 3001
server.listen({ port: 3001 }, (err, address) => {
  console.log('Article Service running on port 3001');
});
```

### 2. Controller (apps/article/controllers/createArticle.ts)
```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import { ArticleService } from '../services/ArticleService';

export async function createArticleController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const articleData = request.body as CreateArticleData;
    const userId = request.user.id; // From auth middleware
    
    // Call service to handle business logic
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

### 3. Service (apps/article/services/ArticleService.ts)
```typescript
import { db, articles } from '@conduit/database';

export class ArticleService {
  static async create(data: CreateArticleData, userId: string) {
    // Generate slug from title
    const slug = data.title.toLowerCase().replace(/\s+/g, '-');
    
    // Create article in database
    const [article] = await db
      .insert(articles)
      .values({
        ...data,
        slug,
        userId,
        createdAt: new Date()
      })
      .returning();
    
    return article;
  }
  
  static async getAll() {
    return await db.select().from(articles);
  }
  
  static async getById(id: string) {
    const [article] = await db
      .select()
      .from(articles)
      .where(eq(articles.id, id));
    
    return article;
  }
}
```

### 4. Routes (apps/article/routes.ts)
```typescript
import { FastifyInstance } from 'fastify';
import { createArticleController } from './controllers/createArticle';
import { getArticlesController } from './controllers/getArticles';

export async function articleRoutes(fastify: FastifyInstance) {
  // POST /api/articles
  fastify.post('/', createArticleController);
  
  // GET /api/articles
  fastify.get('/', getArticlesController);
  
  // GET /api/articles/:id
  fastify.get('/:id', getArticleByIdController);
}
```

## Example: User Service (apps/user)

### Server on different port (apps/user/server.ts)
```typescript
import fastify from 'fastify';
import { userRoutes } from './routes';

const server = fastify();
server.register(userRoutes, { prefix: '/api/users' });

// Different port!
server.listen({ port: 3002 }, () => {
  console.log('User Service running on port 3002');
});
```

## How Frontend Calls Each Service

```typescript
// Frontend code
const createArticle = async (articleData) => {
  // Call Article Service directly
  const response = await fetch('http://localhost:3001/api/articles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(articleData)
  });
  return response.json();
};

const getUser = async (userId) => {
  // Call User Service directly  
  const response = await fetch(`http://localhost:3002/api/users/${userId}`);
  return response.json();
};
```

## Pros and Cons

### ✅ Pros
- **Independent teams**: Article team can work without waiting for User team
- **Different technologies**: Article service could use Node.js, User service could use Python
- **Separate scaling**: Scale only the service that needs it
- **Isolated failures**: If User service crashes, Article service still works

### ❌ Cons
- **More complex**: Need to manage multiple servers
- **Network calls**: Services need to call each other over network (slower)
- **Data consistency**: Harder to keep data in sync across services
- **More infrastructure**: Need more servers, load balancers, etc.