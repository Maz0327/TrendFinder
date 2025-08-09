// System Monitor Service - Consolidated from legacy monitoring services
// Part of 2025 rebuild - Phase 1: Foundation & Architecture

export interface SystemStats {
  totalRequests: number;
  totalErrors: number;
  averageResponseTime: number;
  uptime: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  services: {
    database: boolean;
    ai: boolean;
    scraping: boolean;
  };
}

export class SystemMonitor {
  private static instance: SystemMonitor;
  private stats: SystemStats;
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
    this.stats = {
      totalRequests: 0,
      totalErrors: 0,
      averageResponseTime: 0,
      uptime: 0,
      memoryUsage: {
        used: 0,
        total: 0,
        percentage: 0,
      },
      services: {
        database: true,
        ai: true,
        scraping: true,
      },
    };
  }

  static getInstance(): SystemMonitor {
    if (!SystemMonitor.instance) {
      SystemMonitor.instance = new SystemMonitor();
    }
    return SystemMonitor.instance;
  }

  recordRequest(method: string, path: string, statusCode: number, duration: number, userId?: string, userAgent?: string, errorMessage?: string) {
    this.stats.totalRequests++;
    const hasError = statusCode >= 400;
    if (hasError) this.stats.totalErrors++;
    
    // Update average response time
    this.stats.averageResponseTime = 
      (this.stats.averageResponseTime * (this.stats.totalRequests - 1) + duration) / 
      this.stats.totalRequests;
  }

  getStats(): SystemStats {
    this.updateSystemMetrics();
    return { ...this.stats };
  }

  private updateSystemMetrics() {
    this.stats.uptime = Date.now() - this.startTime;
    
    const memUsage = process.memoryUsage();
    this.stats.memoryUsage = {
      used: memUsage.heapUsed,
      total: memUsage.heapTotal,
      percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100,
    };
  }

  setServiceStatus(service: keyof SystemStats['services'], status: boolean) {
    this.stats.services[service] = status;
  }
}

export const systemMonitor = SystemMonitor.getInstance();