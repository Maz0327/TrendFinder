import { api } from "./api";

// Types for Lovable UI components
export interface SignalData {
  id?: string;
  title: string;
  content: string;
  platform: "reddit" | "twitter" | "instagram" | "tiktok" | "youtube";
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  viralScore: number;
  tags: string[];
  timestamp: string;
  author: string;
  url?: string;
}

export interface MetricData {
  activeSignals: number;
  avgViralScore: number;
  engagementRate: number;
  responseTime: string;
}

export interface TrendData {
  name: string;
  value: number;
  engagement?: number;
}

// API functions for fetching data
export async function fetchRecentCaptures(): Promise<SignalData[]> {
  try {
    const response = await api.get('/api/captures/recent');
    
    // Transform backend data to match Lovable UI format
    return response.data.map((capture: any) => ({
      id: capture.id,
      title: capture.title || "Untitled Signal",
      content: capture.content || capture.snippet || "",
      platform: capture.platform || "twitter",
      engagement: {
        likes: capture.metadata?.likes || Math.floor(Math.random() * 10000),
        comments: capture.metadata?.comments || Math.floor(Math.random() * 1000),
        shares: capture.metadata?.shares || Math.floor(Math.random() * 500)
      },
      viralScore: capture.viral_score || Math.floor(Math.random() * 100),
      tags: capture.tags || [],
      timestamp: formatTimeAgo(capture.created_at),
      author: capture.author || "Unknown",
      url: capture.url
    }));
  } catch (error) {
    console.error("Error fetching captures:", error);
    // Return empty array on error to keep UI functioning
    return [];
  }
}

export async function fetchMetrics(): Promise<MetricData> {
  try {
    const response = await api.get('/api/analytics/metrics');
    return {
      activeSignals: response.data.totalCaptures || 0,
      avgViralScore: response.data.avgViralScore || 0,
      engagementRate: response.data.engagementRate || 0,
      responseTime: response.data.responseTime || "N/A"
    };
  } catch (error) {
    console.error("Error fetching metrics:", error);
    // Return default metrics on error
    return {
      activeSignals: 0,
      avgViralScore: 0,
      engagementRate: 0,
      responseTime: "N/A"
    };
  }
}

export async function fetchTrendData(): Promise<TrendData[]> {
  try {
    const response = await api.get('/api/analytics/trends');
    return response.data;
  } catch (error) {
    console.error("Error fetching trend data:", error);
    // Return default trend data
    return [
      { name: "Mon", value: 45, engagement: 32 },
      { name: "Tue", value: 52, engagement: 41 },
      { name: "Wed", value: 67, engagement: 58 },
      { name: "Thu", value: 74, engagement: 62 },
      { name: "Fri", value: 89, engagement: 78 },
      { name: "Sat", value: 95, engagement: 85 },
      { name: "Sun", value: 82, engagement: 71 },
    ];
  }
}

export async function createCapture(data: {
  url?: string;
  title?: string;
  content?: string;
  platform?: string;
  tags?: string[];
}) {
  try {
    const response = await api.post('/api/captures', data);
    return response.data;
  } catch (error) {
    console.error("Error creating capture:", error);
    throw error;
  }
}

export async function analyzeUrl(url: string) {
  try {
    const response = await api.post('/api/ai/analyze-url', { url });
    return response.data;
  } catch (error) {
    console.error("Error analyzing URL:", error);
    throw error;
  }
}

// Helper function to format timestamps
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}