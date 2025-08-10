import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, Key, Database, Puzzle, Save, TestTube, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface PlatformConfig {
  platform: string;
  datasetId: string;
  status: 'configured' | 'not_configured' | 'error';
}

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    gemini: '',
    brightDataUsername: '',
    brightDataPassword: '',
  });

  const [platformConfigs, setPlatformConfigs] = useState<Record<string, string>>({});
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  type BrightDataStatus = { status: string; message?: string };
  type Instructions = { platforms: PlatformConfig[] };

  // Get Bright Data status
  const { data: brightDataStatus } = useQuery<BrightDataStatus>({
    queryKey: ['/api/bright-data/status'],
    queryFn: () => api.get<BrightDataStatus>('/api/bright-data/status'),
  });

  // Get configuration instructions
  const { data: instructions } = useQuery<Instructions>({
    queryKey: ['/api/bright-data/instructions'],
    queryFn: () => api.get<Instructions>('/api/bright-data/instructions'),
  });

  // Test Bright Data connection
  const testBrightData = useMutation({
    mutationFn: async () => {
      return api.get<{ success: boolean; message: string }>('/api/bright-data/test');
    },
    onSuccess: (data) => {
      setTestResults(prev => ({ ...prev, brightData: data }));
      toast({
        title: "Connection Test Complete",
        description: data.message || "Bright Data API test successful",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Connection Test Failed",
        description: error.message || "Failed to test Bright Data connection",
        variant: "destructive",
      });
    },
  });

  // Update dataset configuration
  const updateDatasetConfig = useMutation({
    mutationFn: async (params: { platform: string; datasetId: string }) => {
      return api.post<{ success: boolean; message: string }>('/api/bright-data/config', params);
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Configuration Updated",
        description: `Dataset ID updated for ${variables.platform}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bright-data/status'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update configuration",
        variant: "destructive",
      });
    },
  });

  const handleSaveDatasetId = (platform: string) => {
    const datasetId = platformConfigs[platform];
    if (!datasetId) {
      toast({
        title: "Dataset ID Required",
        description: "Please enter a dataset ID",
        variant: "destructive",
      });
      return;
    }
    updateDatasetConfig.mutate({ platform, datasetId });
  };

  const handleTestExtension = () => {
    // Open extension stats endpoint in new tab
    window.open('/api/chrome-extension/stats', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 lg:p-6">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Platform Settings</h1>
          <p className="text-sm lg:text-base text-gray-600">Configure API integrations and platform connections</p>
        </div>

        <Tabs defaultValue="api-keys" className="space-y-4 lg:space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="api-keys" className="text-xs lg:text-sm">API Keys</TabsTrigger>
            <TabsTrigger value="bright-data" className="text-xs lg:text-sm">Bright Data</TabsTrigger>
            <TabsTrigger value="chrome-extension" className="text-xs lg:text-sm">Extension</TabsTrigger>
            <TabsTrigger value="preferences" className="text-xs lg:text-sm">Preferences</TabsTrigger>
          </TabsList>

          {/* API Keys Tab */}
          <TabsContent value="api-keys">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Key Configuration
                </CardTitle>
                <CardDescription>Manage your API keys for AI services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    API keys are stored securely as environment variables. Never share or expose your keys.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="openai-key">OpenAI API Key</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="openai-key"
                        type="password"
                        placeholder="sk-..."
                        value={apiKeys.openai}
                        onChange={(e) => setApiKeys(prev => ({ ...prev, openai: e.target.value }))}
                      />
                      <Button variant="outline" size="sm">
                        Test
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Used for content analysis and hook generation</p>
                  </div>

                  <div>
                    <Label htmlFor="gemini-key">Google Gemini API Key</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="gemini-key"
                        type="password"
                        placeholder="AIza..."
                        value={apiKeys.gemini}
                        onChange={(e) => setApiKeys(prev => ({ ...prev, gemini: e.target.value }))}
                      />
                      <Button variant="outline" size="sm">
                        Test
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Used for visual intelligence and cultural analysis</p>
                  </div>
                </div>

                <Button className="w-full" disabled>
                  <Save className="mr-2 h-4 w-4" />
                  Save API Keys (Contact Admin)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bright Data Tab */}
          <TabsContent value="bright-data">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Bright Data Configuration
                  </CardTitle>
                  <CardDescription>Configure dataset IDs for each platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(brightDataStatus as any)?.platforms && Object.entries((brightDataStatus as any).platforms).map(([platform, config]: [string, any]) => (
                      <div key={platform} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium capitalize">{platform}</span>
                            <Badge variant={config.datasetId ? "default" : "secondary"}>
                              {config.datasetId ? "Configured" : "Not Configured"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {config.datasetId || "No dataset ID configured"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Dataset ID"
                            value={platformConfigs[platform] || ''}
                            onChange={(e) => setPlatformConfigs(prev => ({ ...prev, [platform]: e.target.value }))}
                            className="w-48"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSaveDatasetId(platform)}
                            disabled={updateDatasetConfig.isPending}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <Button
                      onClick={() => testBrightData.mutate()}
                      disabled={testBrightData.isPending}
                      className="w-full"
                    >
                      {testBrightData.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Testing Connection...
                        </>
                      ) : (
                        <>
                          <TestTube className="mr-2 h-4 w-4" />
                          Test Bright Data Connection
                        </>
                      )}
                    </Button>
                  </div>

                  {testResults.brightData && (
                    <Alert className="mt-4" variant={testResults.brightData.success ? "default" : "destructive"}>
                      <AlertDescription>
                        {testResults.brightData.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Instructions Card */}
              {instructions && (
                <Card>
                  <CardHeader>
                    <CardTitle>Setup Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <ol className="space-y-2">
                        {(instructions as any).steps?.map((step: string, index: number) => (
                          <li key={index} className="text-sm text-gray-700">{step}</li>
                        ))}
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Chrome Extension Tab */}
          <TabsContent value="chrome-extension">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Puzzle className="h-5 w-5" />
                  Chrome Extension Status
                </CardTitle>
                <CardDescription>Manage your Strategic Content Capture extension</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Extension Status</span>
                      <Badge variant="default">Installed</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Version 1.0.0</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">API Connection</span>
                      <Badge variant="default">Connected</Badge>
                    </div>
                    <p className="text-sm text-gray-600">http://localhost:5000</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Extension Features</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2">
                      <span className="text-sm">Real-time Content Capture</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-2">
                      <span className="text-sm">Viral Potential Scoring</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-2">
                      <span className="text-sm">Truth Analysis Integration</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-2">
                      <span className="text-sm">Keyboard Shortcuts</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleTestExtension} variant="outline" className="flex-1">
                    <TestTube className="mr-2 h-4 w-4" />
                    Test Extension API
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Settings className="mr-2 h-4 w-4" />
                    Extension Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>User Preferences</CardTitle>
                <CardDescription>Customize your Content Radar experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-scan">Auto-scan on startup</Label>
                      <p className="text-sm text-gray-500">Automatically fetch new content when opening the dashboard</p>
                    </div>
                    <Switch id="auto-scan" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifications">Desktop notifications</Label>
                      <p className="text-sm text-gray-500">Get notified when high-viral content is detected</p>
                    </div>
                    <Switch id="notifications" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="dark-mode">Dark mode</Label>
                      <p className="text-sm text-gray-500">Use dark theme for the interface</p>
                    </div>
                    <Switch id="dark-mode" />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <Label>Default Time Range</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    <Button variant="outline" size="sm">1 Hour</Button>
                    <Button variant="default" size="sm">24 Hours</Button>
                    <Button variant="outline" size="sm">7 Days</Button>
                    <Button variant="outline" size="sm">30 Days</Button>
                  </div>
                </div>

                <Button className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}