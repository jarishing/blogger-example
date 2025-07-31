// Common types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// User types
export interface User extends BaseEntity {
  email: string;
  username: string;
  bio?: string;
  image?: string;
}

export interface Profile {
  username: string;
  bio?: string;
  image?: string;
  following: boolean;
}

// Article types
export interface Article extends BaseEntity {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  favorited: boolean;
  favoritesCount: number;
  author: Profile;
}

export interface Comment extends BaseEntity {
  body: string;
  author: Profile;
}

// Authentication types
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// API types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
}

// Form types
export interface CreateArticleData {
  title: string;
  description: string;
  body: string;
  tagList?: string[];
}

export interface UpdateArticleData {
  title?: string;
  description?: string;
  body?: string;
}

export interface UpdateUserData {
  email?: string;
  username?: string;
  bio?: string;
  image?: string;
}

export interface CreateCommentData {
  body: string;
}
