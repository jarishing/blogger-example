import { z } from "zod";

// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().transform(Number).pipe(z.number().positive()).default("3000"),
  
  // Database
  DATABASE_URL: z.string().url(),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("7d"),
  
  // CORS
  CORS_ORIGIN: z.string().url().optional(),
  
  // Rate limiting
  RATE_LIMIT_WINDOW: z.string().transform(Number).pipe(z.number().positive()).default("900000"), // 15 minutes
  RATE_LIMIT_MAX: z.string().transform(Number).pipe(z.number().positive()).default("100"),
});

export type Env = z.infer<typeof envSchema>;

// Parse and validate environment variables
export const env = envSchema.parse(process.env);

// Application configuration
export const config = {
  app: {
    name: "RealWorld Modern App",
    version: "1.0.0",
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    isDevelopment: env.NODE_ENV === "development",
    isProduction: env.NODE_ENV === "production",
    isTest: env.NODE_ENV === "test",
  },
  
  database: {
    url: env.DATABASE_URL,
  },
  
  auth: {
    jwt: {
      secret: env.JWT_SECRET,
      expiresIn: env.JWT_EXPIRES_IN,
    },
  },
  
  cors: {
    origin: env.CORS_ORIGIN || "*",
    credentials: true,
  },
  
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW,
    max: env.RATE_LIMIT_MAX,
  },
  
  validation: {
    password: {
      minLength: 6,
      maxLength: 128,
    },
    username: {
      minLength: 3,
      maxLength: 30,
      pattern: /^[a-zA-Z0-9_-]+$/,
    },
    email: {
      maxLength: 254,
    },
    article: {
      title: {
        minLength: 1,
        maxLength: 255,
      },
      description: {
        minLength: 1,
        maxLength: 500,
      },
      body: {
        minLength: 1,
        maxLength: 50000,
      },
    },
  },
} as const;

export default config;