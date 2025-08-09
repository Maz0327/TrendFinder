// Migrating to new API client - Phase 2
import { apiClient } from './api-client';
import type { User } from "@shared/schema";

export interface AuthResponse {
  success: boolean;
  user: {
    id: number;
    email: string;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword?: string;
}

export class AuthService {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Login failed');
    }
    
    return { success: true, user: { id: result.user.id, email: result.user.email } };
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Registration failed');
    }
    
    return { success: true, user: { id: result.user.id, email: result.user.email } };
  }

  async logout(): Promise<void> {
    await apiClient.auth.logout();
  }

  async getCurrentUser(): Promise<{ user: { id: number; email: string } | null }> {
    const response = await fetch('/api/auth/me', {
      credentials: 'include',
    });
    
    const result = await response.json();
    console.log('getCurrentUser response:', result);
    
    if (!result.success || !result.user) {
      return { user: null };
    }
    
    return { user: { id: result.user.id, email: result.user.email } };
  }
}

export const authService = new AuthService();
