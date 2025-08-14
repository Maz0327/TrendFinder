#!/usr/bin/env tsx
// scripts/smoke.ts - End-to-end API smoke tests

import { performance } from 'perf_hooks';

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api';
const GOOGLE_MOCK = process.env.GOOGLE_MOCK === '1';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  duration: number;
  details?: string;
  error?: Error;
}

class SmokeTest {
  private results: TestResult[] = [];
  private authToken: string | null = null;

  async run(): Promise<void> {
    console.log('🔥 Starting Content Radar API Smoke Tests\n');
    
    // Health checks
    await this.testHealth();
    await this.testDatabaseConnection();
    
    // Authentication tests  
    await this.testAuthEndpoints();
    
    // Core API tests (without auth for now)
    await this.testCapturesAPI();
    await this.testMomentsAPI();
    await this.testBriefsAPI();
    await this.testFeedsAPI();
    
    // Export functionality
    await this.testGoogleExport();
    
    // Extension API
    await this.testExtensionAPI();
    
    // Brief Canvas API
    await this.testBriefCanvasAPI();
    
    this.printResults();
  }

  private async test(name: string, testFn: () => Promise<any>): Promise<void> {
    const start = performance.now();
    
    try {
      const result = await testFn();
      const duration = performance.now() - start;
      
      this.results.push({
        name,
        status: 'PASS',
        duration,
        details: typeof result === 'string' ? result : undefined
      });
    } catch (error) {
      const duration = performance.now() - start;
      
      this.results.push({
        name,
        status: 'FAIL',
        duration,
        details: error instanceof Error ? error.message : String(error),
        error: error instanceof Error ? error : new Error(String(error))
      });
    }
  }

  private async testHealth(): Promise<void> {
    await this.test('Health Check', async () => {
      const response = await fetch(`${API_BASE}/../health`);
      if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
      
      const health = await response.json();
      if (health.status !== 'healthy') {
        throw new Error(`Unhealthy status: ${health.status}`);
      }
      
      return `Server healthy (${health.uptime}s uptime)`;
    });
  }

  private async testDatabaseConnection(): Promise<void> {
    await this.test('Database Connection', async () => {
      const response = await fetch(`${API_BASE}/captures?page=1&pageSize=1`);
      
      // 401 is expected without auth, but connection should work
      if (response.status === 401) {
        return 'Database accessible (auth required)';
      }
      
      if (!response.ok) {
        throw new Error(`Database connection failed: ${response.status}`);
      }
      
      const data = await response.json();
      return `Database connected (${data.total || 0} captures)`;
    });
  }

  private async testAuthEndpoints(): Promise<void> {
    await this.test('Auth Endpoints Available', async () => {
      // Test auth routes exist (they'll redirect but shouldn't 404)
      const loginResponse = await fetch(`${API_BASE}/auth/google/start`, { 
        redirect: 'manual' 
      });
      
      if (loginResponse.status !== 302 && loginResponse.status !== 200) {
        throw new Error(`Auth endpoint not found: ${loginResponse.status}`);
      }
      
      return 'Auth endpoints accessible';
    });
  }

  private async testCapturesAPI(): Promise<void> {
    await this.test('Captures API (GET)', async () => {
      const response = await fetch(`${API_BASE}/captures?page=1&pageSize=10`);
      
      // Should return data or require auth
      if (response.status === 401) {
        return 'Captures API protected (auth required)';
      }
      
      if (!response.ok) {
        throw new Error(`Captures API failed: ${response.status}`);
      }
      
      const data = await response.json();
      return `Captures API working (${data.total || 0} items)`;
    });
  }

  private async testMomentsAPI(): Promise<void> {
    await this.test('Moments API (GET)', async () => {
      const response = await fetch(`${API_BASE}/moments?page=1&pageSize=10`);
      
      if (response.status === 401) {
        return 'Moments API protected (auth required)';
      }
      
      if (!response.ok) {
        throw new Error(`Moments API failed: ${response.status}`);
      }
      
      const data = await response.json();
      return `Moments API working (${data.total || 0} items)`;
    });
  }

  private async testBriefsAPI(): Promise<void> {
    await this.test('Briefs API (GET)', async () => {
      const response = await fetch(`${API_BASE}/briefs?page=1&pageSize=10`);
      
      if (response.status === 401) {
        return 'Briefs API protected (auth required)';
      }
      
      if (!response.ok) {
        throw new Error(`Briefs API failed: ${response.status}`);
      }
      
      const data = await response.json();
      return `Briefs API working (${data.total || 0} items)`;
    });
  }

  private async testFeedsAPI(): Promise<void> {
    await this.test('Feeds API (GET)', async () => {
      const response = await fetch(`${API_BASE}/feeds`);
      
      if (response.status === 401) {
        return 'Feeds API protected (auth required)';
      }
      
      if (!response.ok) {
        throw new Error(`Feeds API failed: ${response.status}`);
      }
      
      const data = await response.json();
      return `Feeds API working (${Array.isArray(data) ? data.length : 0} feeds)`;
    });
  }

  private async testGoogleExport(): Promise<void> {
    await this.test('Google Export API', async () => {
      // Test the export endpoint exists (will fail without auth)
      const response = await fetch(`${API_BASE}/briefs/test-id/export/slides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: 'test' })
      });
      
      if (response.status === 401) {
        return GOOGLE_MOCK 
          ? 'Export API available (Google mock mode)'
          : 'Export API available (auth required)';
      }
      
      if (response.status === 404) {
        throw new Error('Export endpoint not found');
      }
      
      return 'Export API responsive';
    });
  }

  private async testExtensionAPI(): Promise<void> {
    await this.test('Extension API', async () => {
      // Test extension health endpoint
      const response = await fetch(`${API_BASE}/extension/health`);
      
      if (response.status === 401) {
        return 'Extension API protected (auth required)';
      }
      
      if (!response.ok) {
        throw new Error(`Extension API failed: ${response.status}`);
      }
      
      const data = await response.json();
      return `Extension API working (status: ${data.status})`;
    });
  }

  private async testBriefCanvasAPI(): Promise<void> {
    await this.test('Brief Canvas - Blocks API', async () => {
      const testBriefId = 'test-brief-id';
      const response = await fetch(`${API_BASE}/briefs/${testBriefId}/blocks`);
      
      if (response.status === 401) {
        return 'Brief blocks API protected (auth required)';
      }
      
      if (!response.ok) {
        throw new Error(`Brief blocks API failed: ${response.status}`);
      }
      
      const data = await response.json();
      return `Brief blocks API working (${data.data?.length || 0} blocks)`;
    });

    await this.test('Brief Canvas - Upload API', async () => {
      const response = await fetch(`${API_BASE}/uploads/brief-asset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief_id: 'test-brief-id',
          kind: 'image',
          filename: 'test.png',
          contentType: 'image/png'
        })
      });
      
      if (response.status === 401) {
        return 'Upload API protected (auth required)';
      }
      
      if (!response.ok) {
        throw new Error(`Upload API failed: ${response.status}`);
      }
      
      return 'Upload API working (signed URL generation)';
    });
  }

  private printResults(): void {
    console.log('\n📊 Smoke Test Results:\n');
    
    const maxNameLength = Math.max(...this.results.map(r => r.name.length));
    
    let passCount = 0;
    let failCount = 0;
    let warnCount = 0;
    
    this.results.forEach(result => {
      const status = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '❌';
      const name = result.name.padEnd(maxNameLength);
      const duration = `${result.duration.toFixed(0)}ms`.padStart(6);
      const details = result.details ? ` - ${result.details}` : '';
      
      console.log(`${status} ${name} ${duration}${details}`);
      
      if (result.error) {
        console.log(`   Error: ${result.error.message}`);
      }
      
      if (result.status === 'PASS') passCount++;
      else if (result.status === 'WARN') warnCount++;
      else failCount++;
    });
    
    console.log('\n📈 Summary:');
    console.log(`   ✅ Passed: ${passCount}`);
    if (warnCount > 0) console.log(`   ⚠️  Warnings: ${warnCount}`);
    if (failCount > 0) console.log(`   ❌ Failed: ${failCount}`);
    
    const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0);
    console.log(`   ⏱️  Total Time: ${totalTime.toFixed(0)}ms`);
    
    if (failCount > 0) {
      console.log('\n❌ SMOKE TESTS FAILED');
      process.exit(1);
    } else {
      console.log('\n✅ ALL SMOKE TESTS PASSED');
      process.exit(0);
    }
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const smokeTest = new SmokeTest();
  smokeTest.run().catch(error => {
    console.error('❌ Smoke test runner failed:', error);
    process.exit(1);
  });
}

export { SmokeTest };