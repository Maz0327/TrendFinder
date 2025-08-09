// Additional type exports for frontend compatibility

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword?: string;
}

// Re-export from schema for backward compatibility
export * from './supabase-schema';