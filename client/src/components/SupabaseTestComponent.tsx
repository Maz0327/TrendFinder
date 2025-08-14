import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export function SupabaseTestComponent() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [testResults, setTestResults] = useState<any[]>([]);
  const { user, session, signOut } = useAuth();

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    const results = [];
    
    try {
      // Test 1: API Connection - test captures endpoint
      try {
        const capturesResponse = await api.get('/captures', { page: 1, pageSize: 1 });
        results.push({
          test: 'API Connection',
          status: 'passed',
          details: `API responding - ${capturesResponse.total || 0} captures available`,
        });
      } catch (error) {
        results.push({
          test: 'API Connection',
          status: 'failed',
          details: error instanceof Error ? error.message : 'API connection failed',
        });
      }

      // Test 2: Auth status
      results.push({
        test: 'Authentication',
        status: session ? 'passed' : 'no-session',
        details: session ? `Logged in as ${user?.email || 'user'}` : 'No active session',
      });

      // Test 3: API Health
      try {
        const healthResponse = await fetch('/health');
        const health = await healthResponse.json();
        results.push({
          test: 'System Health',
          status: health.status === 'healthy' ? 'passed' : 'warning',
          details: health.status === 'healthy' ? 'All services healthy' : `Status: ${health.status}`,
        });
      } catch (error) {
        results.push({
          test: 'System Health',
          status: 'failed',
          details: 'Health check failed',
        });
      }

      setTestResults(results);
      setConnectionStatus(results.some(r => r.status === 'failed') ? 'error' : 'connected');
    } catch (error) {
      results.push({
        test: 'General Connection',
        status: 'failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
      setTestResults(results);
      setConnectionStatus('error');
    }
  };

  const handleGoogleSignIn = async () => {
    // Redirect to Google OAuth through our API
    window.location.href = '/api/auth/google/start?redirect=' + encodeURIComponent(window.location.pathname);
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Supabase Integration Status
          <Badge 
            variant={connectionStatus === 'connected' ? 'default' : connectionStatus === 'error' ? 'destructive' : 'secondary'}
          >
            {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'error' ? 'Error' : 'Testing...'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Tests */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Connection Tests</h4>
          {testResults.map((result, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded border">
              <span className="text-sm">{result.test}</span>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={result.status === 'passed' ? 'default' : result.status === 'failed' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {result.status}
                </Badge>
                <span className="text-xs text-muted-foreground">{result.details}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Auth Test */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Authentication Test</h4>
          {user ? (
            <div className="p-3 bg-green-50 rounded border border-green-200">
              <p className="text-sm text-green-800">
                ✅ Signed in as: {user.email}
              </p>
              <Button onClick={handleSignOut} size="sm" variant="outline" className="mt-2">
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded border">
              <p className="text-sm text-gray-700 mb-2">Test authentication with Google:</p>
              <Button onClick={handleGoogleSignIn} size="sm">
                Sign In with Google
              </Button>
            </div>
          )}
        </div>

        {/* Retry Button */}
        <Button onClick={testConnection} variant="outline" className="w-full">
          Re-test Connection
        </Button>
      </CardContent>
    </Card>
  );
}