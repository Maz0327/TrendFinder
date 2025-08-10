import { useState, useEffect } from 'react';
import { supabase } from '@shared/supabase-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export function SupabaseDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSupabaseSetup();
  }, []);

  const checkSupabaseSetup = async () => {
    setLoading(true);
    const info: any = {
      envVars: {
        url: import.meta.env.VITE_SUPABASE_URL,
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing',
        urlLength: import.meta.env.VITE_SUPABASE_URL?.length || 0,
        anonKeyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0,
      },
      connection: 'Testing...',
      auth: 'Testing...',
      session: null,
      error: null
    };

    try {
      // Test basic connection
      const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
      if (error) {
        info.connection = `Error: ${error.message}`;
        info.error = error;
      } else {
        info.connection = 'Connected';
      }

      // Check auth status
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) {
        info.auth = `Error: ${authError.message}`;
      } else {
        info.auth = session ? 'Authenticated' : 'Not signed in';
        info.session = session;
      }

    } catch (err) {
      info.connection = `Connection failed: ${err}`;
      info.error = err;
    }

    setDebugInfo(info);
    setLoading(false);
  };

  const testGoogleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        console.error('Google sign in error:', error);
        alert(`Google sign in error: ${error.message}`);
      } else {
        console.log('Google sign in initiated:', data);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert(`Unexpected error: ${err}`);
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
          Supabase Debug Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Environment Variables */}
        <div>
          <h4 className="font-medium mb-2">Environment Variables</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>VITE_SUPABASE_URL:</span>
              <Badge variant={debugInfo.envVars?.url ? 'default' : 'destructive'}>
                {debugInfo.envVars?.url ? `${debugInfo.envVars.url.substring(0, 30)}...` : 'Missing'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>VITE_SUPABASE_ANON_KEY:</span>
              <Badge variant={debugInfo.envVars?.anonKey === 'Present' ? 'default' : 'destructive'}>
                {debugInfo.envVars?.anonKey} ({debugInfo.envVars?.anonKeyLength} chars)
              </Badge>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div>
          <h4 className="font-medium mb-2">Connection Status</h4>
          <div className="flex items-center gap-2">
            {debugInfo.connection === 'Connected' ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">{debugInfo.connection}</span>
          </div>
        </div>

        {/* Auth Status */}
        <div>
          <h4 className="font-medium mb-2">Authentication Status</h4>
          <div className="flex items-center gap-2">
            {debugInfo.auth === 'Authenticated' ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            )}
            <span className="text-sm">{debugInfo.auth}</span>
          </div>
          {debugInfo.session && (
            <div className="mt-2 p-2 bg-green-50 rounded text-xs">
              User: {debugInfo.session.user?.email}
            </div>
          )}
        </div>

        {/* Test Buttons */}
        <div className="space-y-2">
          <Button onClick={testGoogleSignIn} className="w-full">
            Test Google Sign In
          </Button>
          <Button onClick={checkSupabaseSetup} variant="outline" className="w-full">
            Refresh Debug Info
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