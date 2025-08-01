/**
 * Article and blog content related types
 */

import {
  ContentType, RecordStatus, PublicationStatus
} from './base';
import { PublicUser } from './user';

// Core article interface matching the database schema
export interface Article {
  articleId: string; // Primary key from database
  recordStatus: RecordStatus;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  slug: string;
  description: string;
  body: string;
  userId: string;
  author?: PublicUser;
  publishedAt?: Date;
  scheduledAt?: Date;
  status: PublicationStatus;
  contentType: ContentType;
  tags: string[];
  categories: string[];
  featuredImage?: string;
  excerpt?: string;
  readingTime?: number;
  wordCount?: number;
  seoData?: SEOData;
  analytics?: ArticleAnalytics;
}

// Public article for display (with author info)
export interface PublicArticle extends Omit<Article, 'userId' | 'recordStatus'> {
  author: PublicUser;
  isFavorited: boolean;
  favoritesCount: number;
  commentsCount: number;
  viewsCount: number;
  sharesCount: number;
  canEdit: boolean;
  relatedArticles?: PublicArticle[];
}

// Article creation data
export interface CreateArticleData {
  title: string;
  description: string;
  body: string;
  tags?: string[];
  categories?: string[];
  featuredImage?: string;
  status?: PublicationStatus;
  scheduledAt?: Date;
  contentType?: ContentType;
  seoData?: Partial<SEOData>;
}

// Article update data
export interface UpdateArticleData {
  title?: string;
  description?: string;
  body?: string;
  tags?: string[];
  categories?: string[];
  featuredImage?: string;
  status?: PublicationStatus;
  scheduledAt?: Date;
  seoData?: Partial<SEOData>;
}

// SEO data for articles
export interface SEOData {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  robots?: string;
  structuredData?: Record<string, unknown>;
}

// Article analytics
export interface ArticleAnalytics {
  views: number;
  uniqueViews: number;
  avgReadTime: number;
  bounceRate: number;
  shares: Record<string, number>; // platform -> count
  referrers: Record<string, number>; // source -> count
  countries: Record<string, number>; // country -> count
  devices: Record<string, number>; // device type -> count
  lastUpdated: Date;
}

// Article comment
export interface Comment {
  commentId: string;
  recordStatus: RecordStatus;
  createdAt: Date;
  updatedAt: Date;
  body: string;
  articleId: string;
  userId: string;
  parentId?: string; // for nested comments
  author?: PublicUser;
  likesCount: number;
  isLiked: boolean;
  canEdit: boolean;
  canDelete: boolean;
  replies?: Comment[];
  isEdited: boolean;
  editedAt?: Date;
}

// Comment creation data
export interface CreateCommentData {
  body: string;
  articleId: string;
  parentId?: string;
}

// Article favorite/like
export interface ArticleFavorite {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  articleId: string;
}

// Article search and filtering
export interface ArticleSearchParams {
  query?: string;
  tags?: string[];
  categories?: string[];
  author?: string;
  status?: PublicationStatus;
  contentType?: ContentType;
  publishedAfter?: Date;
  publishedBefore?: Date;
  featured?: boolean;
  sortBy?: 'createdAt' | 'publishedAt' | 'title' | 'views' | 'favorites';
  sortOrder?: 'asc' | 'desc';
}

// Article feed options
export interface ArticleFeedOptions {
  following?: boolean; // show only followed authors
  personalized?: boolean; // use recommendation algorithm
  includeScheduled?: boolean;
  excludeRead?: boolean;
  tags?: string[];
  categories?: string[];
  limit?: number;
  offset?: number;
}

// Article series
export interface ArticleSeries {
  seriesId: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  description?: string;
  slug: string;
  userId: string;
  coverImage?: string;
  articles: Article[];
  articlesCount: number;
  isPublished: boolean;
  tags: string[];
}

// Article draft
export interface ArticleDraft {
  draftId: string;
  createdAt: Date;
  updatedAt: Date;
  title?: string;
  body?: string;
  articleId?: string; // if editing existing article
  userId: string;
  autoSaved: boolean;
  lastEditedAt: Date;
}

// Tag management
export interface Tag {
  tagId: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  articlesCount: number;
  followersCount: number;
  isOfficial: boolean;
}

// Category management
export interface Category {
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  image?: string;
  articlesCount: number;
  followersCount: number;
  isVisible: boolean;
  sortOrder: number;
}

// Article template
export interface ArticleTemplate {
  templateId: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  description: string;
  content: string;
  userId: string;
  isPublic: boolean;
  tags: string[];
  usageCount: number;
}

// Reading list
export interface ReadingList {
  listId: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description?: string;
  userId: string;
  isPublic: boolean;
  articles: PublicArticle[];
  articlesCount: number;
  followersCount: number;
}

// Article revision history
export interface ArticleRevision {
  revisionId: string;
  createdAt: Date;
  updatedAt: Date;
  articleId: string;
  title: string;
  body: string;
  changesSummary?: string;
  userId: string;
  version: number;
}

// Article statistics
export interface ArticleStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  scheduledArticles: number;
  totalViews: number;
  totalFavorites: number;
  totalComments: number;
  averageReadTime: number;
  topTags: Array<{ tag: string; count: number }>;
  recentActivity: Array<{
    type: 'published' | 'favorited' | 'commented';
    count: number;
    date: Date;
  }>;
}

// Content moderation
export interface ContentModeration {
  moderationId: string;
  createdAt: Date;
  updatedAt: Date;
  contentId: string;
  contentType: 'article' | 'comment';
  reason: string;
  action: 'flag' | 'hide' | 'delete' | 'approve';
  moderatorId: string;
  reporterId?: string;
  isResolved: boolean;
  notes?: string;
}
