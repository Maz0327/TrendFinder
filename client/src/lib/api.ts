import { apiRequest } from "./queryClient";
import type { ContentRadarItem, DashboardStats, ScanHistory, ContentFilters, ScanResult } from "@/types";

export const api = {
  // Stats
  getStats: (): Promise<DashboardStats> =>
    apiRequest("GET", "/api/stats").then(res => res.json()),

  // Content
  getContent: (filters?: ContentFilters): Promise<ContentRadarItem[]> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.platform) params.append("platform", filters.platform);
    if (filters?.timeRange) params.append("timeRange", filters.timeRange);
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    
    const url = `/api/content${params.toString() ? `?${params.toString()}` : ""}`;
    return apiRequest("GET", url).then(res => res.json());
  },

  getContentById: (id: string): Promise<ContentRadarItem> =>
    apiRequest("GET", `/api/content/${id}`).then(res => res.json()),

  createContent: (data: Partial<ContentRadarItem>): Promise<ContentRadarItem> =>
    apiRequest("POST", "/api/content", data).then(res => res.json()),

  updateContent: (id: string, data: Partial<ContentRadarItem>): Promise<ContentRadarItem> =>
    apiRequest("PATCH", `/api/content/${id}`, data).then(res => res.json()),

  deleteContent: (id: string): Promise<{ success: boolean }> =>
    apiRequest("DELETE", `/api/content/${id}`).then(res => res.json()),

  // Scanning
  runScan: (): Promise<ScanResult> =>
    apiRequest("POST", "/api/scan").then(res => res.json()),

  getScanHistory: (limit?: number): Promise<ScanHistory[]> => {
    const url = `/api/scans${limit ? `?limit=${limit}` : ""}`;
    return apiRequest("GET", url).then(res => res.json());
  },

  // Hooks
  generateAdditionalHooks: (id: string): Promise<{ hooks: string[] }> =>
    apiRequest("POST", `/api/content/${id}/hooks`).then(res => res.json()),

  // Search
  search: (query: string): Promise<ContentRadarItem[]> =>
    apiRequest("GET", `/api/search?q=${encodeURIComponent(query)}`).then(res => res.json()),

  // Export
  exportData: (format: 'json' | 'csv' = 'json'): Promise<Response> =>
    apiRequest("GET", `/api/export?format=${format}`),

  // Schedule
  startScheduledScans: (intervalMinutes?: number): Promise<{ success: boolean; message: string }> =>
    apiRequest("POST", "/api/schedule/start", { intervalMinutes }).then(res => res.json()),

  stopScheduledScans: (): Promise<{ success: boolean; message: string }> =>
    apiRequest("POST", "/api/schedule/stop").then(res => res.json()),

  getScheduleStatus: (): Promise<{ isActive: boolean }> =>
    apiRequest("GET", "/api/schedule/status").then(res => res.json()),
};
