export * from "./connection";
export * from "./schema";

// Re-export all schema tables for convenience
export { auth } from "./schema/auth";
export { articles } from "./schema/articles";
export { users } from "./schema/users";