import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function SupabaseTest() {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runSupabaseTests = async () => {
    setLoading(true);
    const results: any = {};

    try {
      // Test environment variables
      results.envVars = {
        url: import.meta.env.VITE_SUPABASE_URL ? 'Present' : 'Missing',
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing',
        urlValue: import.meta.env.VITE_SUPABASE_URL || 'Not set',
        anonKeyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0
      };

      // Test basic connectivity
      try {
        const response = await fetch(import.meta.env.VITE_SUPABASE_URL + '/rest/v1/', {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        });
        results.connectivity = {
          status: response.ok ? 'success' : 'failed',
          statusCode: response.status,
          statusText: response.statusText
        };
      } catch (error: any) {
        results.connectivity = {
          status: 'error',
          error: error.message
        };
      }

      // Test import
      try {
        const { supabase } = await import('@shared/supabase-client');
        results.importTest = {
          status: 'success',
          client: !!supabase
        };
        
        // Test auth
        try {
          const { data, error } = await supabase.auth.getSession();
          results.authTest = {
            status: error ? 'error' : 'success',
            error: error?.message,
            hasSession: !!data.session
          };
        } catch (authError: any) {
          results.authTest = {
            status: 'error', 
            error: authError.message
          };
        }
      } catch (importError: any) {
        results.importTest = {
          status: 'error',
          error: importError.message
        };
      }

    } catch (error: any) {
      results.globalError = error.message;
    }

    setTestResults(results);
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'success' ? 'default' : status === 'error' || status === 'failed' ? 'destructive' : 'secondary';
    return <Badge variant={variant}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Supabase Connection Test</h1>
          <p className="text-muted-foreground mt-2">
            Test your Supabase configuration and connectivity
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Run Diagnostic Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runSupabaseTests}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Running Tests...' : 'Test Supabase Connection'}
            </Button>
          </CardContent>
        </Card>

        {testResults && (
          <div className="space-y-4">
            {/* Environment Variables */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Environment Variables
                  {getStatusIcon(testResults.envVars?.url === 'Present' && testResults.envVars?.anonKey === 'Present' ? 'success' : 'error')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>VITE_SUPABASE_URL:</span>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(testResults.envVars?.url === 'Present' ? 'success' : 'error')}
                    <span className="text-sm font-mono">{testResults.envVars?.urlValue}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>VITE_SUPABASE_ANON_KEY:</span>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(testResults.envVars?.anonKey === 'Present' ? 'success' : 'error')}
                    <span className="text-sm">Length: {testResults.envVars?.anonKeyLength}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Connectivity Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Network Connectivity
                  {getStatusIcon(testResults.connectivity?.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Status:</span>
                    {getStatusBadge(testResults.connectivity?.status)}
                  </div>
                  {testResults.connectivity?.statusCode && (
                    <div className="flex justify-between items-center">
                      <span>HTTP Status:</span>
                      <span>{testResults.connectivity.statusCode} {testResults.connectivity.statusText}</span>
                    </div>
                  )}
                  {testResults.connectivity?.error && (
                    <Alert>
                      <AlertDescription>{testResults.connectivity.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Import Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Client Import
                  {getStatusIcon(testResults.importTest?.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Import Status:</span>
                    {getStatusBadge(testResults.importTest?.status)}
                  </div>
                  {testResults.importTest?.error && (
                    <Alert>
                      <AlertDescription>{testResults.importTest.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Auth Test */}
            {testResults.authTest && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Authentication Test
                    {getStatusIcon(testResults.authTest?.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Auth Status:</span>
                      {getStatusBadge(testResults.authTest?.status)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Has Session:</span>
                      <span>{testResults.authTest.hasSession ? 'Yes' : 'No'}</span>
                    </div>
                    {testResults.authTest?.error && (
                      <Alert>
                        <AlertDescription>{testResults.authTest.error}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Global Error */}
            {testResults.globalError && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Global Error: {testResults.globalError}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>
    </div>
  );
}