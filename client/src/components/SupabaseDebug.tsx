import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function SupabaseDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const { user, session } = useAuth();

  useEffect(() => {
    checkSupabaseSetup();
  }, []);

  const checkSupabaseSetup = async () => {
    setLoading(true);
    const info: any = {
      envVars: {
        apiBase: import.meta.env.VITE_API_BASE_URL || '/api',
        hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
        hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      apiConnection: 'Testing...',
      auth: 'Testing...',
      session: session,
      user: user,
      error: null
    };

    try {
      // Test API connection
      try {
        const capturesTest = await api.get('/captures', { page: 1, pageSize: 1 });
        info.apiConnection = `Connected - API responding (${capturesTest.total || 0} captures)`;
      } catch (error: any) {
        info.apiConnection = `API Error: ${error.message}`;
        info.error = error;
      }

      // Test health endpoint
      try {
        const healthResponse = await fetch('/health');
        const health = await healthResponse.json();
        info.health = health.status || 'unknown';
      } catch (error) {
        info.health = 'unavailable';
      }

      // Auth status from context
      info.auth = session ? `Authenticated as ${user?.email || 'user'}` : 'Not signed in';

    } catch (err) {
      info.apiConnection = `Connection failed: ${err}`;
      info.error = err;
    }

    setDebugInfo(info);
    setLoading(false);
  };

  const testGoogleSignIn = async () => {
    try {
      // Redirect to our API endpoint for Google OAuth
      window.location.href = '/api/auth/google/start?redirect=' + encodeURIComponent(window.location.pathname);
    } catch (error) {
      console.error('Google sign in failed:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            <span>Checking Supabase setup...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          System Debug Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Environment Variables */}
        <div>
          <h4 className="font-medium mb-2">API Configuration</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>API Base:</span>
              <Badge variant="default">
                {debugInfo.envVars?.apiBase}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Supabase URL:</span>
              <Badge variant={debugInfo.envVars?.hasSupabaseUrl ? 'default' : 'destructive'}>
                {debugInfo.envVars?.hasSupabaseUrl ? 'Configured' : 'Missing'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Supabase Key:</span>
              <Badge variant={debugInfo.envVars?.hasSupabaseKey ? 'default' : 'destructive'}>
                {debugInfo.envVars?.hasSupabaseKey ? 'Configured' : 'Missing'}
              </Badge>
            </div>
          </div>
        </div>

        {/* API Connection Status */}
        <div>
          <h4 className="font-medium mb-2">API Connection Status</h4>
          <div className="flex items-center gap-2">
            {debugInfo.apiConnection?.includes('Connected') ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">{debugInfo.apiConnection}</span>
          </div>
          {debugInfo.health && (
            <div className="mt-1 text-xs text-gray-600">
              System Health: {debugInfo.health}
            </div>
          )}
        </div>

        {/* Auth Status */}
        <div>
          <h4 className="font-medium mb-2">Authentication Status</h4>
          <div className="flex items-center gap-2">
            {debugInfo.auth?.includes('Authenticated') ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            )}
            <span className="text-sm">{debugInfo.auth}</span>
          </div>
          {debugInfo.user && (
            <div className="mt-2 p-2 bg-green-50 rounded text-xs">
              User: {debugInfo.user.email}
            </div>
          )}
        </div>

        {/* Test Buttons */}
        <div className="space-y-2">
          <Button onClick={testGoogleSignIn} className="w-full">
            Test Google Sign In
          </Button>
          <Button onClick={checkSupabaseSetup} variant="outline" className="w-full">
            Refresh System Info
          </Button>
        </div>

        {/* Error Details */}
        {debugInfo.error && (
          <div className="mt-4 p-3 bg-red-50 rounded">
            <h5 className="text-sm font-medium text-red-800 mb-1">Error Details:</h5>
            <pre className="text-xs text-red-700 whitespace-pre-wrap">
              {JSON.stringify(debugInfo.error, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}