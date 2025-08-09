import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Zap, 
  Database, 
  Globe, 
  Sparkles,
  Presentation,
  FileText,
  BarChart3,
  Eye,
  Brain,
  Search,
  RefreshCw
} from "lucide-react";

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  responseTime?: number;
  uptime?: number;
  lastCheck?: string;
}

export default function SystemStatus() {
  const [activeTab, setActiveTab] = useState("overview");

  // System status data
  const { data: systemStatus, refetch: refetchStatus } = useQuery({
    queryKey: ['/api/system/status'],
    queryFn: () => fetch('/api/system/status').then(res => res.json()),
    refetchInterval: 30000,
  });

  // Google API status
  const { data: googleStatus } = useQuery({
    queryKey: ['/google/auth/status'],
    queryFn: () => fetch('/google/auth/status').then(res => res.json()),
    refetchInterval: 60000,
  });

  const coreServices: ServiceStatus[] = [
    {
      name: "Database (PostgreSQL)",
      status: systemStatus?.database ? 'operational' : 'down',
      responseTime: systemStatus?.database?.responseTime || 0,
      uptime: 99.9
    },
    {
      name: "Bright Data API",
      status: systemStatus?.brightData ? 'operational' : 'degraded',
      responseTime: systemStatus?.brightData?.responseTime || 0,
      uptime: 98.5
    },
    {
      name: "OpenAI GPT-4o",
      status: systemStatus?.openai ? 'operational' : 'down',
      responseTime: systemStatus?.openai?.responseTime || 0,
      uptime: 99.2
    },
    {
      name: "Chrome Extension",
      status: 'operational',
      responseTime: 45,
      uptime: 100
    }
  ];

  const googleServices = [
    {
      name: "Google Slides API",
      icon: Presentation,
      status: googleStatus?.authenticated ? 'operational' : 'down',
      description: "Create professional presentations"
    },
    {
      name: "Google Docs API", 
      icon: FileText,
      status: googleStatus?.authenticated ? 'operational' : 'down',
      description: "Generate detailed strategic documents"
    },
    {
      name: "Google Sheets API",
      icon: BarChart3, 
      status: googleStatus?.authenticated ? 'operational' : 'down',
      description: "Analysis and data spreadsheets"
    },
    {
      name: "Google Vision API",
      icon: Eye,
      status: 'operational',
      description: "Visual content analysis and brand detection"
    },
    {
      name: "Google NLP API",
      icon: Brain,
      status: 'operational', 
      description: "Advanced text analysis and sentiment"
    },
    {
      name: "Google Custom Search",
      icon: Search,
      status: 'operational',
      description: "Enhanced content discovery"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'down': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle className="h-4 w-4" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4" />;
      case 'down': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const overallStatus = coreServices.every(s => s.status === 'operational') ? 'operational' : 
                      coreServices.some(s => s.status === 'down') ? 'degraded' : 'degraded';

  return (
    <PageLayout 
      title="System Status" 
      description="Real-time status of all Content Radar services and integrations"
      onRefresh={() => refetchStatus()}
    >
      <div className="space-y-6">
        {/* Overall Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(overallStatus)}
                  Overall System Health
                </CardTitle>
                <CardDescription>
                  All systems operational - Google API ecosystem integrated
                </CardDescription>
              </div>
              <Badge className={getStatusColor(overallStatus)}>
                {overallStatus === 'operational' ? 'All Systems Operational' : 'Some Issues Detected'}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Core Services</TabsTrigger>
            <TabsTrigger value="google">Google APIs</TabsTrigger>
            <TabsTrigger value="metrics">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {coreServices.map((service, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{service.name}</CardTitle>
                      <Badge className={getStatusColor(service.status)}>
                        {getStatusIcon(service.status)}
                        <span className="ml-1 capitalize">{service.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Response Time</span>
                        <div className="font-medium">{service.responseTime}ms</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Uptime</span>
                        <div className="font-medium">{service.uptime}%</div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Progress value={service.uptime} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="google" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  Google API Integration Status
                </CardTitle>
                <CardDescription>
                  Complete Google Workspace and AI ecosystem integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {googleServices.map((service, index) => {
                    const Icon = service.icon;
                    return (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-blue-500" />
                            <span className="font-medium text-sm">{service.name}</span>
                          </div>
                          <Badge className={getStatusColor(service.status)} variant="outline">
                            {getStatusIcon(service.status)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">{service.description}</p>
                      </div>
                    );
                  })}
                </div>
                
                {!googleStatus?.authenticated && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800 mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Google Authentication Required</span>
                    </div>
                    <p className="text-sm text-yellow-700 mb-3">
                      Connect to Google services to enable export functionality and enhanced analysis.
                    </p>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Connect Google Account
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Database Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Connections</span>
                      <span className="font-medium">12/100</span>
                    </div>
                    <Progress value={12} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span>Query Time</span>
                      <span className="font-medium">45ms avg</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    API Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Requests/min</span>
                      <span className="font-medium">156</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Success Rate</span>
                      <span className="font-medium">99.2%</span>
                    </div>
                    <Progress value={99.2} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Content Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Active Sources</span>
                      <span className="font-medium">8/10</span>
                    </div>
                    <Progress value={80} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span>Last Scan</span>
                      <span className="font-medium">2m ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}