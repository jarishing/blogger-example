/**
 * Articles router for CRUD operations and article management
 */

import { TRPCError } from '@trpc/server';

// Simple Gateway + Saga imports
import { ArticleServiceClient, UserServiceClient } from '../services/SimpleServiceClient';
import { ArticlePublicationSaga } from '../services/SimpleSaga';

// Types imports
import type { 
  Article, 
  PublicArticle, 
  Comment,
  PublicUser 
} from '@conduit/types';

import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import {
  createArticleSchema,
  updateArticleSchema,
  getArticleBySlugSchema,
  getArticleByIdSchema,
  deleteArticleSchema,
  searchArticlesSchema,
  articleFeedSchema,
  createCommentSchema,
  updateCommentSchema,
  getCommentsSchema,
  deleteCommentSchema,
  favoriteArticleSchema,
  unfavoriteArticleSchema,
  getFavoritesSchema,
  createSeriesSchema,
  updateSeriesSchema,
  addToSeriesSchema,
  getTagsSchema,
  followTagSchema,
  unfollowTagSchema,
  getArticleAnalyticsSchema
} from '../schemas';

export const articlesRouter = createTRPCRouter({
  /**
   * Create Article
   * Uses Gateway + Saga orchestration pattern for complex article creation
   */
  create: protectedProcedure
    .input(createArticleSchema)
    .mutation(async ({ input, ctx }): Promise<PublicArticle> => {
      // 1. Validate user permissions (user is guaranteed by protectedProcedure)
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        });
      }

      const {
        title, description, body, tags, status
      } = input;

      try {
        // 2. Use Simple Article Publication Saga
        const publicationSaga = new ArticlePublicationSaga(
          { title, description, body, tags: tags || [] },
          ctx.user.userId
        );

        // 3. Execute the saga (creates article + updates stats)
        const result = await publicationSaga.executePublication();

        // 4. Get author info for response
        const userService = new UserServiceClient();
        const authorResponse = await userService.getUser(ctx.user.userId);

        const author = authorResponse.success ? authorResponse.data : {
          userId: ctx.user.userId,
          username: ctx.user.username || 'Unknown'
        };

        // 5. Return simple response
        return {
          ...result.create_article,
          author: author as PublicUser,
          isFavorited: false,
          favoritesCount: 0,
          commentsCount: 0,
          viewsCount: 0,
          sharesCount: 0,
          canEdit: true,
          tags: tags || [],
          categories: [],
          status: 'published' as const,
          contentType: 'article' as const
        } as PublicArticle;

      } catch (error) {
        console.error('Article creation saga failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create article: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }),

  /**
   * Update Article
   */
  update: protectedProcedure
    .input(updateArticleSchema.extend({ articleId: createArticleSchema.shape.title }))
    .mutation(async ({ input, ctx }) => {
      // TODO: Implement article update logic
      // This would typically:
      // 1. Check if user owns the article or has permissions
      // 2. Update article fields
      // 3. Handle slug changes if title changed
      // 4. Update tags and categories
      // 5. Return updated article

      const { articleId, ...updateData } = input;

      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Update article endpoint not yet implemented'
      });
    }),

  /**
   * Get Article by ID
   * Uses Gateway pattern to fetch article with aggregated data
   */
  getById: publicProcedure
    .input(getArticleByIdSchema)
    .query(async ({ input, ctx }): Promise<PublicArticle> => {
      const { articleId } = input;

      try {
        // 1. Simple Gateway pattern - call Article service
        const articleService = new ArticleServiceClient();
        const articleResponse = await articleService.getArticle(articleId);
        
        if (!articleResponse.success) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Article not found'
          });
        }

        const article = articleResponse.data!;

        // 2. Get author info from User service
        const userService = new UserServiceClient();
        const authorResponse = await userService.getUser(article.userId);
        
        const author = authorResponse.success ? authorResponse.data : {
          userId: article.userId,
          username: 'Unknown'
        };

        // 3. Simple response aggregation
        return {
          ...article,
          author: author as PublicUser,
          isFavorited: false,
          favoritesCount: 0,
          commentsCount: 0,
          viewsCount: 0,
          sharesCount: 0,
          canEdit: ctx.user?.userId === article.userId,
          status: 'published' as const,
          contentType: 'article' as const
        } as PublicArticle;

      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        console.error('Error getting article:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get article'
        });
      }
    }),

  /**
   * Get Article by Slug
   */
  getBySlug: publicProcedure
    .input(getArticleBySlugSchema)
    .query(async ({ input, ctx }) => {
      // TODO: Implement get article by slug logic
      const { slug } = input;

      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Get article by slug endpoint not yet implemented'
      });
    }),

  /**
   * Delete Article
   */
  delete: protectedProcedure
    .input(deleteArticleSchema)
    .mutation(async ({ input, ctx }) => {
      // TODO: Implement article deletion logic
      // This would typically:
      // 1. Check if user owns the article or has permissions
      // 2. Soft delete or hard delete the article
      // 3. Handle associated data (comments, favorites, etc.)

      const { articleId } = input;

      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Delete article endpoint not yet implemented'
      });
    }),

  /**
   * Search Articles
   */
  search: publicProcedure
    .input(searchArticlesSchema)
    .query(async ({ input, ctx }) => {
      // TODO: Implement article search logic
      // This would typically:
      // 1. Build search query with filters
      // 2. Execute search with pagination
      // 3. Include author information
      // 4. Calculate favorites/likes for current user
      // 5. Return paginated results

      const {
        query, tags, author, page, limit
      } = input;

      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Search articles endpoint not yet implemented'
      });
    }),

  /**
   * Get Article Feed
   */
  feed: protectedProcedure
    .input(articleFeedSchema)
    .query(async ({ input, ctx }) => {
      // TODO: Implement article feed logic
      // This would typically:
      // 1. Get articles from followed users if following=true
      // 2. Apply personalization algorithm if enabled
      // 3. Filter by tags/categories
      // 4. Exclude read articles if requested
      // 5. Return paginated feed

      const {
        following, personalized, tags, page, limit
      } = input;

      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Article feed endpoint not yet implemented'
      });
    }),

  /**
   * Get Public Feed (for homepage)
   */
  publicFeed: publicProcedure
    .input(articleFeedSchema.omit({ following: true, personalized: true }))
    .query(async ({ input, ctx }) => {
      // TODO: Implement public feed logic
      const { tags, page, limit } = input;

      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Public feed endpoint not yet implemented'
      });
    }),

  /**
   * Favorite Article
   */
  favorite: protectedProcedure
    .input(favoriteArticleSchema)
    .mutation(async ({ input, ctx }) => {
      // TODO: Implement favorite article logic
      // This would typically:
      // 1. Check if article exists
      // 2. Check if not already favorited
      // 3. Create favorite record
      // 4. Update article favorite count
      // 5. Create notification for author

      const { articleId } = input;

      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Favorite article endpoint not yet implemented'
      });
    }),

  /**
   * Unfavorite Article
   */
  unfavorite: protectedProcedure
    .input(unfavoriteArticleSchema)
    .mutation(async ({ input, ctx }) => {
      // TODO: Implement unfavorite article logic
      const { articleId } = input;

      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Unfavorite article endpoint not yet implemented'
      });
    }),

  /**
   * Get User Favorites
   */
  getFavorites: protectedProcedure
    .input(getFavoritesSchema)
    .query(async ({ input, ctx }) => {
      // TODO: Implement get favorites logic
      const { userId, page, limit } = input;

      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Get favorites endpoint not yet implemented'
      });
    }),

  /**
   * Comments sub-router
   */
  comments: createTRPCRouter({
    /**
     * Create Comment
     */
    create: protectedProcedure
      .input(createCommentSchema)
      .mutation(async ({ input, ctx }) => {
        // TODO: Implement comment creation logic
        const { articleId, body, parentId } = input;

        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: 'Create comment endpoint not yet implemented'
        });
      }),

    /**
     * Update Comment
     */
    update: protectedProcedure
      .input(updateCommentSchema)
      .mutation(async ({ input, ctx }) => {
        // TODO: Implement comment update logic
        const { commentId, body } = input;

        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: 'Update comment endpoint not yet implemented'
        });
      }),

    /**
     * Get Comments
     */
    list: publicProcedure
      .input(getCommentsSchema)
      .query(async ({ input, ctx }) => {
        // TODO: Implement get comments logic
        const {
          articleId, parentId, page, limit
        } = input;

        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: 'Get comments endpoint not yet implemented'
        });
      }),

    /**
     * Delete Comment
     */
    delete: protectedProcedure
      .input(deleteCommentSchema)
      .mutation(async ({ input, ctx }) => {
        // TODO: Implement comment deletion logic
        const { commentId } = input;

        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: 'Delete comment endpoint not yet implemented'
        });
      })
  }),

  /**
   * Series sub-router
   */
  series: createTRPCRouter({
    /**
     * Create Series
     */
    create: protectedProcedure
      .input(createSeriesSchema)
      .mutation(async ({ input, ctx }) => {
        // TODO: Implement series creation logic
        const { title, description, tags } = input;

        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: 'Create series endpoint not yet implemented'
        });
      }),

    /**
     * Update Series
     */
    update: protectedProcedure
      .input(updateSeriesSchema)
      .mutation(async ({ input, ctx }) => {
        // TODO: Implement series update logic
        const { seriesId, title, description } = input;

        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: 'Update series endpoint not yet implemented'
        });
      }),

    /**
     * Add Article to Series
     */
    addArticle: protectedProcedure
      .input(addToSeriesSchema)
      .mutation(async ({ input, ctx }) => {
        // TODO: Implement add article to series logic
        const { seriesId, articleId, order } = input;

        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: 'Add article to series endpoint not yet implemented'
        });
      })
  }),

  /**
   * Tags sub-router
   */
  tags: createTRPCRouter({
    /**
     * Get Tags
     */
    list: publicProcedure
      .input(getTagsSchema)
      .query(async ({ input, ctx }) => {
        // TODO: Implement get tags logic
        const { query, popular, limit } = input;

        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: 'Get tags endpoint not yet implemented'
        });
      }),

    /**
     * Follow Tag
     */
    follow: protectedProcedure
      .input(followTagSchema)
      .mutation(async ({ input, ctx }) => {
        // TODO: Implement follow tag logic
        const { tagId } = input;

        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: 'Follow tag endpoint not yet implemented'
        });
      }),

    /**
     * Unfollow Tag
     */
    unfollow: protectedProcedure
      .input(unfollowTagSchema)
      .mutation(async ({ input, ctx }) => {
        // TODO: Implement unfollow tag logic
        const { tagId } = input;

        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: 'Unfollow tag endpoint not yet implemented'
        });
      })
  }),

  /**
   * Analytics sub-router
   */
  analytics: createTRPCRouter({
    /**
     * Get Article Analytics
     */
    getArticleStats: protectedProcedure
      .input(getArticleAnalyticsSchema)
      .query(async ({ input, ctx }) => {
        // TODO: Implement article analytics logic
        const {
          articleId, period, startDate, endDate
        } = input;

        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: 'Get article analytics endpoint not yet implemented'
        });
      })
  })
});
