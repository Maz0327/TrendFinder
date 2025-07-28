import { type User, type InsertUser, type ContentRadar, type InsertContentRadar, type ScanHistory, type InsertScanHistory } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Content Radar methods
  getContentItems(filters?: {
    category?: string;
    platform?: string;
    timeRange?: string;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<ContentRadar[]>;
  getContentItemById(id: string): Promise<ContentRadar | undefined>;
  createContentItem(item: InsertContentRadar): Promise<ContentRadar>;
  updateContentItem(id: string, updates: Partial<ContentRadar>): Promise<ContentRadar | undefined>;
  deleteContentItem(id: string): Promise<boolean>;
  
  // Statistics methods
  getStats(): Promise<{
    totalTrends: number;
    viralPotential: number;
    activeSources: number;
    avgScore: number;
  }>;
  
  // Scan History methods
  createScanHistory(scan: InsertScanHistory): Promise<ScanHistory>;
  getRecentScans(limit?: number): Promise<ScanHistory[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private contentItems: Map<string, ContentRadar>;
  private scanHistory: Map<string, ScanHistory>;

  constructor() {
    this.users = new Map();
    this.contentItems = new Map();
    this.scanHistory = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getContentItems(filters?: {
    category?: string;
    platform?: string;
    timeRange?: string;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<ContentRadar[]> {
    let items = Array.from(this.contentItems.values()).filter(item => item.isActive);
    
    if (filters?.category && filters.category !== 'all') {
      items = items.filter(item => item.category === filters.category);
    }
    
    if (filters?.platform) {
      items = items.filter(item => item.platform === filters.platform);
    }
    
    if (filters?.timeRange) {
      const now = new Date();
      const cutoff = new Date();
      
      switch (filters.timeRange) {
        case 'hour':
          cutoff.setHours(now.getHours() - 1);
          break;
        case '6hours':
          cutoff.setHours(now.getHours() - 6);
          break;
        case '24hours':
          cutoff.setDate(now.getDate() - 1);
          break;
        case 'week':
          cutoff.setDate(now.getDate() - 7);
          break;
      }
      
      items = items.filter(item => item.createdAt && new Date(item.createdAt) >= cutoff);
    }
    
    // Sort items
    const sortBy = filters?.sortBy || 'viralScore';
    items.sort((a, b) => {
      switch (sortBy) {
        case 'recency':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'engagement':
          return (b.engagement || 0) - (a.engagement || 0);
        case 'viralScore':
        default:
          return parseFloat(b.viralScore || '0') - parseFloat(a.viralScore || '0');
      }
    });
    
    // Apply pagination
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 50;
    
    return items.slice(offset, offset + limit);
  }

  async getContentItemById(id: string): Promise<ContentRadar | undefined> {
    return this.contentItems.get(id);
  }

  async createContentItem(item: InsertContentRadar): Promise<ContentRadar> {
    const id = randomUUID();
    const now = new Date();
    const contentItem: ContentRadar = {
      ...item,
      id,
      createdAt: now,
      updatedAt: now,
      summary: item.summary || null,
      content: item.content || null,
      hook1: item.hook1 || null,
      hook2: item.hook2 || null,
      viralScore: item.viralScore || null,
      engagement: item.engagement || null,
      growthRate: item.growthRate || null,
      metadata: item.metadata || null,
      isActive: item.isActive !== undefined ? item.isActive : true,
    };
    this.contentItems.set(id, contentItem);
    return contentItem;
  }

  async updateContentItem(id: string, updates: Partial<ContentRadar>): Promise<ContentRadar | undefined> {
    const existing = this.contentItems.get(id);
    if (!existing) return undefined;
    
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.contentItems.set(id, updated);
    return updated;
  }

  async deleteContentItem(id: string): Promise<boolean> {
    return this.contentItems.delete(id);
  }

  async getStats(): Promise<{
    totalTrends: number;
    viralPotential: number;
    activeSources: number;
    avgScore: number;
  }> {
    const items = Array.from(this.contentItems.values()).filter(item => item.isActive);
    const highViralItems = items.filter(item => parseFloat(item.viralScore || '0') >= 8.0);
    const avgScore = items.length > 0 
      ? items.reduce((sum, item) => sum + parseFloat(item.viralScore || '0'), 0) / items.length
      : 0;
    
    const activePlatforms = new Set(items.map(item => item.platform)).size;
    
    return {
      totalTrends: items.length,
      viralPotential: highViralItems.length,
      activeSources: activePlatforms,
      avgScore: Math.round(avgScore * 10) / 10,
    };
  }

  async createScanHistory(scan: InsertScanHistory): Promise<ScanHistory> {
    const id = randomUUID();
    const scanRecord: ScanHistory = {
      ...scan,
      id,
      createdAt: new Date(),
      itemsFound: scan.itemsFound || null,
      errorMessage: scan.errorMessage || null,
      scanDuration: scan.scanDuration || null,
    };
    this.scanHistory.set(id, scanRecord);
    return scanRecord;
  }

  async getRecentScans(limit = 10): Promise<ScanHistory[]> {
    const scans = Array.from(this.scanHistory.values());
    return scans
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
