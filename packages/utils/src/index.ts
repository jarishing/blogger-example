import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import slugify from 'slugify';
import { z } from 'zod';

// Password utilities
export const PasswordUtils = {
  async hash(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  },

  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
};

// JWT utilities
export const JwtUtils = {
  sign(payload: object, secret: string, expiresIn: string = '7d'): string {
    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  },

  verify<T = any>(token: string, secret: string): T {
    return jwt.verify(token, secret) as T;
  },

  decode<T = any>(token: string): T | null {
    return jwt.decode(token) as T | null;
  }
};

// Slug utilities
export const SlugUtils = {
  generate(text: string): string {
    return slugify(text, { lower: true, strict: true });
  }
};

// Date utilities
export const DateUtils = {
  format(date: Date): string {
    return date.toISOString();
  },

  addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  differenceInDays(dateLeft: Date, dateRight: Date): number {
    const msInDay = 24 * 60 * 60 * 1000;
    return Math.floor((dateLeft.getTime() - dateRight.getTime()) / msInDay);
  }
};

// Validation utilities
export const ValidationUtils = {
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(3).max(50),

  isEmail(email: string): boolean {
    return this.email.safeParse(email).success;
  },

  isStrongPassword(password: string): boolean {
    const strongPassword = z.string()
      .min(8)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/);
    return strongPassword.safeParse(password).success;
  }
};

// Array utilities
export const ArrayUtils = {
  unique<T>(array: T[]): T[] {
    return [...new Set(array)];
  },

  chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i];
      shuffled[i] = shuffled[j]!;
      shuffled[j] = temp!;
    }
    return shuffled;
  }
};

// String utilities
export const StringUtils = {
  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return `${str.slice(0, length)}...`;
  },

  removeSpecialChars(str: string): string {
    return str.replace(/[^a-zA-Z0-9\s]/g, '');
  },

  countWords(str: string): number {
    return str.trim().split(/\s+/).filter((word) => word.length > 0).length;
  }
};

// Export all utilities
export * from './types';

// Re-export for convenience
export {
  PasswordUtils as Password,
  JwtUtils as Jwt,
  SlugUtils as SlugUtil,
  DateUtils as Date,
  ValidationUtils as Validation,
  ArrayUtils as Array,
  StringUtils as String
};
