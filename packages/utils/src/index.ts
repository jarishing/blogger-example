import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import slugify from "slugify";
import { z } from "zod";

// Password utilities
export class PasswordUtils {
  static async hash(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

// JWT utilities
export class JwtUtils {
  static sign(payload: object, secret: string, expiresIn: string = "7d"): string {
    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  }

  static verify<T = any>(token: string, secret: string): T {
    return jwt.verify(token, secret) as T;
  }

  static decode<T = any>(token: string): T | null {
    return jwt.decode(token) as T | null;
  }
}

// Slug utilities
export class SlugUtils {
  static generate(text: string): string {
    return slugify(text, { lower: true, strict: true });
  }
}

// Date utilities
export class DateUtils {
  static format(date: Date): string {
    return date.toISOString();
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static differenceInDays(dateLeft: Date, dateRight: Date): number {
    const msInDay = 24 * 60 * 60 * 1000;
    return Math.floor((dateLeft.getTime() - dateRight.getTime()) / msInDay);
  }
}

// Validation utilities
export class ValidationUtils {
  static email = z.string().email();
  static password = z.string().min(6);
  static username = z.string().min(3).max(50);

  static isEmail(email: string): boolean {
    return this.email.safeParse(email).success;
  }

  static isStrongPassword(password: string): boolean {
    const strongPassword = z.string()
      .min(8)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/);
    return strongPassword.safeParse(password).success;
  }
}

// Array utilities
export class ArrayUtils {
  static unique<T>(array: T[]): T[] {
    return [...new Set(array)];
  }

  static chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  static shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i];
      shuffled[i] = shuffled[j]!;
      shuffled[j] = temp!;
    }
    return shuffled;
  }
}

// String utilities
export class StringUtils {
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  static truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.slice(0, length) + "...";
  }

  static removeSpecialChars(str: string): string {
    return str.replace(/[^a-zA-Z0-9\s]/g, "");
  }

  static countWords(str: string): number {
    return str.trim().split(/\s+/).filter(word => word.length > 0).length;
  }
}

// Export all utilities
export * from "./types";

// Re-export for convenience
export {
  PasswordUtils as Password,
  JwtUtils as Jwt,
  SlugUtils as Slug,
  DateUtils as Date,
  ValidationUtils as Validation,
  ArrayUtils as Array,
  StringUtils as String,
};