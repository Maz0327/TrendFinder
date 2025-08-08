// Monitoring Service - Performance and cost tracking
// Part of 2025 rebuild - Consolidated monitoring and analytics

interface APIUsage {
  service: string;
  endpoint: string;
  count: number;
  averageResponseTime: number;
  errorRate: number;
  lastUsed: Date;
}

interface CostTracking {
  service: string;
  usage: number;
  estimatedCost: number;
  period: string;
}

export class MonitoringService {
  private static instance: MonitoringService;
  private apiUsage: Map<string, APIUsage> = new Map();
  private costTracking: Map<string, CostTracking> = new Map();

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  // Track API usage
  recordAPICall(service: string, endpoint: string, responseTime: number, hasError: boolean = false) {
    const key = `${service}:${endpoint}`;
    const existing = this.apiUsage.get(key) || {
      service,
      endpoint,
      count: 0,
      averageResponseTime: 0,
      errorRate: 0,
      lastUsed: new Date(),
    };

    existing.count++;
    existing.averageResponseTime = 
      (existing.averageResponseTime * (existing.count - 1) + responseTime) / existing.count;
    
    if (hasError) {
      existing.errorRate = ((existing.errorRate * (existing.count - 1)) + 1) / existing.count;
    }
    
    existing.lastUsed = new Date();
    this.apiUsage.set(key, existing);
  }

  // Cost estimation based on usage
  updateCostEstimate(service: string, usage: number) {
    const costRates = {
      'openai-gpt4': 0.03, // per 1K tokens
      'openai-gpt4-mini': 0.0001, // per 1K tokens
      'gemini-pro': 0.0005, // per 1K characters
      'bright-data': 0.001, // per request
      'google-vision': 0.0015, // per image
      'google-nlp': 0.001, // per 1K characters
    };

    const rate = costRates[service] || 0;
    const estimatedCost = usage * rate;

    this.costTracking.set(service, {
      service,
      usage,
      estimatedCost,
      period: 'daily',
    });
  }

  // Get usage statistics
  getUsageStats(): {
    totalAPICalls: number;
    serviceBreakdown: any[];
    topEndpoints: any[];
    errorRates: any[];
  } {
    let totalCalls = 0;
    const serviceBreakdown: any[] = [];
    const endpoints: any[] = [];

    this.apiUsage.forEach((usage) => {
      totalCalls += usage.count;
      
      // Group by service
      const serviceIndex = serviceBreakdown.findIndex(s => s.service === usage.service);
      if (serviceIndex >= 0) {
        serviceBreakdown[serviceIndex].count += usage.count;
      } else {
        serviceBreakdown.push({ service: usage.service, count: usage.count });
      }
      
      endpoints.push({
        endpoint: `${usage.service}:${usage.endpoint}`,
        count: usage.count,
        avgResponseTime: Math.round(usage.averageResponseTime),
        errorRate: (usage.errorRate * 100).toFixed(2) + '%',
      });
    });

    // Sort endpoints by usage
    endpoints.sort((a, b) => b.count - a.count);

    return {
      totalAPICalls: totalCalls,
      serviceBreakdown: serviceBreakdown.sort((a, b) => b.count - a.count),
      topEndpoints: endpoints.slice(0, 10),
      errorRates: endpoints.filter(e => parseFloat(e.errorRate) > 0),
    };
  }

  // Get cost breakdown
  getCostBreakdown(): {
    totalEstimatedCost: number;
    byService: CostTracking[];
    projectedMonthly: number;
  } {
    let total = 0;
    const byService: CostTracking[] = [];

    this.costTracking.forEach((cost) => {
      total += cost.estimatedCost;
      byService.push(cost);
    });

    return {
      totalEstimatedCost: total,
      byService: byService.sort((a, b) => b.estimatedCost - a.estimatedCost),
      projectedMonthly: total * 30, // Assuming daily costs
    };
  }

  // Performance monitoring
  getPerformanceMetrics(): {
    averageResponseTime: number;
    slowestEndpoints: any[];
    uptimePercentage: number;
  } {
    let totalTime = 0;
    let totalCalls = 0;
    const endpoints: any[] = [];

    this.apiUsage.forEach((usage) => {
      totalTime += usage.averageResponseTime * usage.count;
      totalCalls += usage.count;
      
      endpoints.push({
        endpoint: `${usage.service}:${usage.endpoint}`,
        avgTime: Math.round(usage.averageResponseTime),
      });
    });

    endpoints.sort((a, b) => b.avgTime - a.avgTime);

    return {
      averageResponseTime: totalCalls > 0 ? Math.round(totalTime / totalCalls) : 0,
      slowestEndpoints: endpoints.slice(0, 5),
      uptimePercentage: 99.9, // Placeholder - would calculate from actual downtime
    };
  }

  // Clear old data (cleanup)
  clearOldData(daysToKeep: number = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    this.apiUsage.forEach((usage, key) => {
      if (usage.lastUsed < cutoffDate) {
        this.apiUsage.delete(key);
      }
    });
  }
}

export const monitoringService = MonitoringService.getInstance();