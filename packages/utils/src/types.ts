// Utility types for common operations

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type Nullable<T> = T | null;

export type NonNullable<T> = T extends null | undefined ? never : T;

export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

export type ExtractArrayType<T> = T extends (infer U)[] ? U : never;

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

export type PickByType<T, U> = Pick<T, KeysOfType<T, U>>;

export type OmitByType<T, U> = Omit<T, KeysOfType<T, U>>;

// Branded types for better type safety
export type Brand<T, U> = T & { __brand: U };

export type Email = Brand<string, "email">;
export type Username = Brand<string, "username">;
export type HashedPassword = Brand<string, "hashedPassword">;
export type JwtToken = Brand<string, "jwtToken">;
export type Slug = Brand<string, "slug">;

// Result type for error handling
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Pagination types
export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Sort types
export type SortOrder = "asc" | "desc";

export interface SortOptions<T> {
  field: keyof T;
  order: SortOrder;
}

// Filter types
export type FilterOperator = "eq" | "ne" | "lt" | "le" | "gt" | "ge" | "in" | "like";

export interface FilterCondition<T> {
  field: keyof T;
  operator: FilterOperator;
  value: any;
}

export type FilterOptions<T> = FilterCondition<T>[];