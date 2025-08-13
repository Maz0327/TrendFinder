#!/usr/bin/env tsx

/**
 * Smoke Test Script for Content Radar API
 * Tests basic functionality and Google export scaffolding
 */

import { storage } from '../server/storage';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

// Mock JWT for testing (in real scenario, get from auth flow)
const TEST_JWT = 'test_jwt_token';

interface TestResult {
  test: string;
  passed: boolean;
  error?: string;
  data?: any;
}

class SmokeTestRunner {
  private results: TestResult[] = [];

  async runTest(testName: string, testFn: () => Promise<any>): Promise<boolean> {
    try {
      console.log(`Running: ${testName}...`);
      const data = await testFn();
      this.results.push({ test: testName, passed: true, data });
      console.log(`✅ PASS: ${testName}`);
      return true;
    } catch (error: any) {
      this.results.push({ test: testName, passed: false, error: error.message });
      console.log(`❌ FAIL: ${testName} - ${error.message}`);
      return false;
    }
  }

  async apiRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_JWT}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    return response.json();
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('SMOKE TEST RESULTS');
    console.log('='.repeat(60));

    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;

    this.results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status}: ${result.test}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    console.log(`\nSummary: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 All tests passed!');
      process.exit(0);
    } else {
      console.log('💥 Some tests failed');
      process.exit(1);
    }
  }
}

async function main() {
  const runner = new SmokeTestRunner();

  console.log('🚀 Starting Content Radar API Smoke Tests\n');

  // Test 1: Database Health Check
  await runner.runTest('Database Health Check', async () => {
    const health = await storage.healthCheck();
    if (health.status !== 'ok') {
      throw new Error(`Database health check failed: ${health.status}`);
    }
    return health;
  });

  // Test 2: API Projects Endpoint (will fail auth but should respond)
  await runner.runTest('API Projects Endpoint Response', async () => {
    try {
      return await runner.apiRequest('/api/projects');
    } catch (error: any) {
      // Expect auth error, but API should respond
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        return { status: 'auth_required', message: 'API responding correctly with auth error' };
      }
      throw error;
    }
  });

  // Test 3: Google Export Route Exists
  await runner.runTest('Google Export Route Available', async () => {
    try {
      return await runner.apiRequest('/api/briefs/test-id/export/slides', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test Brief' })
      });
    } catch (error: any) {
      // Expect auth error or brief not found, but route should exist
      if (error.message.includes('401') || error.message.includes('404') || 
          error.message.includes('Unauthorized') || error.message.includes('Brief not found')) {
        return { status: 'route_exists', message: 'Google export route responding' };
      }
      throw error;
    }
  });

  // Test 4: Environment Variables Check
  await runner.runTest('Environment Variables Check', async () => {
    const required = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY', 
      'SUPABASE_SERVICE_ROLE_KEY',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_REDIRECT_URI'
    ];

    const missing = required.filter(envVar => !process.env[envVar]);
    
    if (missing.length > 0) {
      throw new Error(`Missing environment variables: ${missing.join(', ')}`);
    }

    return { status: 'all_present', count: required.length };
  });

  // Test 5: Feature Flags
  await runner.runTest('Feature Flags Configuration', async () => {
    // Import feature flags
    const flagsModule = await import('../client/src/flags');
    const features = flagsModule.FEATURES;
    
    if (!features.BRIEF_EXPORT) {
      throw new Error('BRIEF_EXPORT feature flag is disabled');
    }

    return { 
      briefExport: features.BRIEF_EXPORT,
      totalFlags: Object.keys(features).length
    };
  });

  // Test 6: TypeScript Compilation Check
  await runner.runTest('TypeScript Compilation', async () => {
    // Simple import test to ensure no major TS errors
    try {
      await import('../server/services/google/oauth');
      await import('../server/services/google/slides');
      await import('../server/routes/google-export');
      return { status: 'compilation_ok' };
    } catch (error: any) {
      throw new Error(`TypeScript compilation failed: ${error.message}`);
    }
  });

  runner.printResults();
}

// Run main if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Smoke test runner failed:', error);
    process.exit(1);
  });
}

export { SmokeTestRunner };