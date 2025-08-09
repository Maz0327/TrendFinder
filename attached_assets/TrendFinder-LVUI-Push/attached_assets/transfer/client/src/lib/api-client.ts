// New API Client - Phase 2 Frontend Migration
// Replaces scattered service calls with unified API

import { queryClient } from './queryClient';
import type { 
  User, 
  Project, 
  Signal as Capture,  // Using Signal alias for now
  InsertProject,
  InsertSignal as InsertCapture  // Using InsertSignal alias for now
} from '@shared/schema';

// Temporary type aliases until schema fully migrated
type Brief = any;

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseUrl = '/api';

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || data.message || 'Request failed');
    }

    return data.data as T;
  }

  // ========== AUTH API ==========
  auth = {
    login: async (email: string, password: string) => {
      const result = await this.request<{ user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      return result;
    },

    register: async (email: string, password: string) => {
      const result = await this.request<{ user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      return result;
    },

    logout: async () => {
      await this.request('/auth/logout', { method: 'POST' });
      queryClient.clear();
    },

    getCurrentUser: async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        if (!response.ok) return null;
        const data = await response.json();
        console.log('getCurrentUser response:', data);
        return data.user || data.data?.user || null;
      } catch (error) {
        console.error('getCurrentUser error:', error);
        return null;
      }
    },
  };

  // ========== WORKSPACE API ==========
  workspace = {
    getStats: async () => {
      return this.request<{
        totalProjects: number;
        totalCaptures: number;
        capturesByStatus: Record<string, number>;
      }>('/workspace/stats');
    },

    getProjects: async () => {
      return this.request<Project[]>('/workspace/projects');
    },

    createProject: async (data: InsertProject) => {
      return this.request<Project>('/workspace/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    updateProject: async (id: string, data: Partial<InsertProject>) => {
      return this.request<Project>(`/workspace/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
  };

  // ========== CAPTURES API (formerly signals) ==========
  captures = {
    create: async (data: InsertCapture) => {
      return this.request<Capture>('/captures', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    getByProject: async (projectId: string, status?: string) => {
      const query = status ? `?status=${status}` : '';
      return this.request<Capture[]>(`/captures/${projectId}${query}`);
    },

    promote: async (id: string, newStatus: string, reason?: string) => {
      return this.request<Capture>(`/captures/${id}/promote`, {
        method: 'POST',
        body: JSON.stringify({ newStatus, reason }),
      });
    },

    update: async (id: string, data: Partial<InsertCapture>) => {
      return this.request<Capture>(`/captures/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      await this.request(`/captures/${id}`, { method: 'DELETE' });
    },
  };

  // ========== ANALYSIS API ==========
  analysis = {
    analyzeTruth: async (content: string, mode: 'quick' | 'deep' = 'quick') => {
      return this.request<{
        analysis: string;
        tokens: number;
        model: string;
      }>('/analyze/truth', {
        method: 'POST',
        body: JSON.stringify({ content, mode }),
      });
    },

    analyzeVisual: async (imageData: string) => {
      return this.request<{
        analysis: string;
        elements: any[];
      }>('/analyze/visual', {
        method: 'POST',
        body: JSON.stringify({ imageData }),
      });
    },
  };

  // ========== BRIEFS API ==========
  briefs = {
    generate: async (projectId: string, captureIds: string[]) => {
      return this.request<Brief>('/briefs/generate', {
        method: 'POST',
        body: JSON.stringify({ projectId, captureIds }),
      });
    },

    exportToSlides: async (briefId: string) => {
      return this.request<{ url: string }>(`/briefs/${briefId}/export-slides`, {
        method: 'POST',
      });
    },

    list: async (projectId?: string) => {
      const query = projectId ? `?projectId=${projectId}` : '';
      return this.request<Brief[]>(`/briefs${query}`);
    },
  };

  // ========== SCRAPING API ==========
  scraping = {
    scrapeUrl: async (url: string, platform?: string) => {
      return this.request<{
        title: string;
        content: string;
        author?: string;
        platform: string;
        metadata: any;
      }>('/scrape', {
        method: 'POST',
        body: JSON.stringify({ url, platform }),
      });
    },
  };

  // ========== SYSTEM API ==========
  system = {
    health: async () => {
      return this.request<any>('/system/health');
    },

    status: async () => {
      return this.request<{
        message: string;
        version: string;
        phase: string;
        services: Record<string, boolean>;
      }>('/system/status');
    },
  };
}

export const apiClient = new ApiClient();
export default apiClient;