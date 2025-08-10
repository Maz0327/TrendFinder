import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, ExternalLink, Copy, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SupabaseSetup() {
  const [testUrl, setTestUrl] = useState('');
  const [testKey, setTestKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const { toast } = useToast();

  const testConnection = async () => {
    if (!testUrl || !testKey) {
      toast({
        title: "Missing Information",
        description: "Please provide both URL and Anon Key",
        variant: "destructive"
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const url = new URL(testUrl + '/rest/v1/');
      const response = await fetch(url.toString(), {
        headers: {
          'apikey': testKey,
          'Authorization': `Bearer ${testKey}`,
          'Content-Type': 'application/json'
        }
      });

      setTestResult({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        url: url.toString()
      });

      if (response.ok) {
        toast({
          title: "Connection Successful!",
          description: "Your Supabase credentials are working correctly."
        });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message,
        type: error.name
      });
    } finally {
      setTesting(false);
    }
  };

  const copyEnvVars = () => {
    const envVars = `VITE_SUPABASE_URL=${testUrl}
VITE_SUPABASE_ANON_KEY=${testKey}`;
    
    navigator.clipboard.writeText(envVars).then(() => {
      toast({
        title: "Copied!",
        description: "Environment variables copied to clipboard"
      });
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Supabase Setup & Testing</h1>
        <p className="text-muted-foreground">
          Configure and test your Supabase connection for the Content Radar platform.
        </p>
      </div>

      {/* Current Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Current Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>URL:</span>
              <Badge variant="outline" className="font-mono text-xs">
                {import.meta.env.VITE_SUPABASE_URL || 'Not configured'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Anon Key:</span>
              <Badge variant={import.meta.env.VITE_SUPABASE_ANON_KEY ? "default" : "destructive"}>
                {import.meta.env.VITE_SUPABASE_ANON_KEY ? `${import.meta.env.VITE_SUPABASE_ANON_KEY.length} characters` : 'Missing'}
              </Badge>
            </div>
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Connection failed: "Failed to fetch" - Your Supabase project may be inactive, URL incorrect, or CORS not configured.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Setup New Supabase Project</CardTitle>
          <CardDescription>
            Follow these steps to create or verify your Supabase configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <Badge className="mt-1">1</Badge>
                <div>
                  <p className="font-medium">Create Supabase Project</p>
                  <p className="text-sm text-muted-foreground">
                    Go to{' '}
                    <a 
                      href="https://supabase.com/dashboard/projects" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      Supabase Dashboard <ExternalLink className="h-3 w-3" />
                    </a>
                    {' '}and create a new project
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge className="mt-1">2</Badge>
                <div>
                  <p className="font-medium">Get Project Credentials</p>
                  <p className="text-sm text-muted-foreground">
                    In your project settings → API → Project URL and anon/public key
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge className="mt-1">3</Badge>
                <div>
                  <p className="font-medium">Test Connection Below</p>
                  <p className="text-sm text-muted-foreground">
                    Verify your credentials work before updating environment variables
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Connection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test New Credentials</CardTitle>
          <CardDescription>
            Test your Supabase URL and API key before configuring them
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Supabase URL</label>
              <Input
                placeholder="https://your-project.supabase.co"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Anon Key</label>
              <Input
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={testKey}
                onChange={(e) => setTestKey(e.target.value)}
                className="mt-1"
                type="password"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={testConnection} 
                disabled={testing || !testUrl || !testKey}
                className="flex-1"
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </Button>
              
              {testResult?.success && (
                <Button 
                  onClick={copyEnvVars}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy Env Vars
                </Button>
              )}
            </div>

            {testResult && (
              <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  {testResult.success ? (
                    <div>
                      <strong>✓ Connection Successful!</strong>
                      <div className="mt-1 text-sm">
                        Status: {testResult.status} {testResult.statusText}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <strong>✗ Connection Failed</strong>
                      <div className="mt-1 text-sm">
                        Error: {testResult.error || testResult.type}
                      </div>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      {testResult?.success && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">✓ Ready to Configure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>Your Supabase credentials are working! Next steps:</p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Copy the environment variables above</li>
                <li>Update your Replit Secrets with the new values</li>
                <li>Restart your application</li>
                <li>Return to the login page to test authentication</li>
              </ol>
              
              <Alert>
                <AlertDescription>
                  <strong>Environment Variables to Update:</strong><br />
                  <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code><br />
                  <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code>
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}