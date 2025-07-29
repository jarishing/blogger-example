import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { JwtPayload, TokenPair } from "./types";

export class AuthUtils {
  private static readonly SALT_ROUNDS = 12;
  private static readonly ACCESS_TOKEN_EXPIRES = "15m";
  private static readonly REFRESH_TOKEN_EXPIRES = "7d";

  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Verify a password against a hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT access token
   */
  static generateAccessToken(payload: Omit<JwtPayload, "iat" | "exp">, secret: string): string {
    return jwt.sign(payload, secret, { 
      expiresIn: this.ACCESS_TOKEN_EXPIRES,
      issuer: "realworld-app",
      audience: "realworld-users",
    });
  }

  /**
   * Generate JWT refresh token
   */
  static generateRefreshToken(payload: Omit<JwtPayload, "iat" | "exp">, secret: string): string {
    return jwt.sign(payload, secret, { 
      expiresIn: this.REFRESH_TOKEN_EXPIRES,
      issuer: "realworld-app",
      audience: "realworld-users",
    });
  }

  /**
   * Generate both access and refresh tokens
   */
  static generateTokenPair(payload: Omit<JwtPayload, "iat" | "exp">, secret: string): TokenPair {
    return {
      accessToken: this.generateAccessToken(payload, secret),
      refreshToken: this.generateRefreshToken(payload, secret),
    };
  }

  /**
   * Verify and decode JWT token
   */
  static verifyToken(token: string, secret: string): JwtPayload {
    try {
      return jwt.verify(token, secret, {
        issuer: "realworld-app",
        audience: "realworld-users",
      }) as JwtPayload;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  /**
   * Decode JWT token without verification (for debugging)
   */
  static decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch {
      return null;
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authorization?: string): string | null {
    if (!authorization) return null;
    
    const [scheme, token] = authorization.split(" ");
    if (scheme !== "Bearer" || !token) return null;
    
    return token;
  }

  /**
   * Generate secure random token for password resets, email verification, etc.
   */
  static generateSecureToken(): string {
    return require("crypto").randomBytes(32).toString("hex");
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    
    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}