// Auth Service - Clean authentication for 2025 rebuild
// Simplified from legacy auth with proper session management

import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users } from '../../shared/supabase-schema';
import { eq } from 'drizzle-orm';
import type { Request } from 'express';

interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
  };
  error?: string;
}

export class AuthService {
  private static instance: AuthService;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(email: string, password: string): Promise<AuthResult> {
    try {
      // Find user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (!user) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return { success: false, error: 'Invalid credentials' };
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role || 'user',
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  async register(email: string, password: string): Promise<AuthResult> {
    try {
      // Check if user exists
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (existing) {
        return { success: false, error: 'Email already registered' };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          email,
          password: hashedPassword,
          role: 'user',
        })
        .returning();

      return {
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role || 'user',
        },
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  async validateSession(req: Request): Promise<{ isValid: boolean; userId?: string }> {
    if (!req.session?.userId) {
      return { isValid: false };
    }

    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, req.session.userId));

      return { 
        isValid: !!user, 
        userId: user?.id 
      };
    } catch (error) {
      console.error('Session validation error:', error);
      return { isValid: false };
    }
  }

  async logout(req: Request): Promise<void> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

export const authService = AuthService.getInstance();