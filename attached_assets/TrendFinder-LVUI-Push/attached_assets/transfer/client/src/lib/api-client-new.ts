// Updated API Client for redesigned workspace
import { queryClient } from './queryClient';

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

  // ========== WORKSPACE API ==========
  workspace = {
    getStats: async () => {
      return this.request<{
        totalProjects: number;
        totalCaptures: number;
        totalBriefs: number;
        activeProjects: number;
        newCapturesThisWeek: number;
        newBriefsThisMonth: number;
        analysisScore: number;
      }>('/workspace/stats');
    },

    getProjects: async () => {
      return this.request<Array<{
        id: string;
        name: string;
        description?: string;
        createdAt: string;
        captureCount?: number;
        briefCount?: number;
      }>>('/workspace/projects');
    },

    createProject: async (data: { name: string; description?: string }) => {
      return this.request('/workspace/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
  };

  // ========== CAPTURES API ==========
  captures = {
    getAll: async () => {
      return this.request<Array<{
        id: string;
        title: string;
        content?: string;
        sourceUrl?: string;
        projectId?: string;
        tags?: string[];
        status: string;
        createdAt: string;
      }>>('/captures');
    },

    getRecent: async () => {
      return this.request('/captures/recent');
    },

    create: async (data: {
      title: string;
      content?: string;
      sourceUrl?: string;
      projectId?: string;
      tags?: string[];
    }) => {
      return this.request('/captures', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
  };

  // ========== BRIEFS API ==========
  briefs = {
    getAll: async () => {
      return this.request('/briefs');
    },

    generate: async (projectId: string) => {
      return this.request('/briefs/generate', {
        method: 'POST',
        body: JSON.stringify({ projectId }),
      });
    }
  };

  // ========== ANALYTICS API ==========
  analytics = {
    getInsights: async (params: { timeframe?: string; projectId?: string } = {}) => {
      const searchParams = new URLSearchParams();
      if (params.timeframe) searchParams.set('timeframe', params.timeframe);
      if (params.projectId) searchParams.set('projectId', params.projectId);
      
      return this.request(`/analytics/insights?${searchParams.toString()}`);
    }
  };

  // ========== SCRAPE API ==========
  scrape = {
    extractContent: async (url: string) => {
      return this.request<{ title?: string; content?: string }>('/scrape/extract', {
        method: 'POST',
        body: JSON.stringify({ url }),
      });
    }
  };
}

export const apiClient = new ApiClient();