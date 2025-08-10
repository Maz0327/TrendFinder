import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import PageLayout from "@/components/layout/PageLayout";
import { SupabaseTestComponent } from "@/components/SupabaseTestComponent";
import { SupabaseDebug } from "@/components/SupabaseDebug";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Bug, 
  Server, 
  Database, 
  Globe,
  Activity,
  AlertCircle,
  Clock,
  Zap
} from "lucide-react";

interface SystemError {
  id: string;
  type: 'frontend' | 'backend' | 'api' | 'database';
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  endpoint?: string;
  timestamp: string;
  resolved: boolean;
  count: number;
}

interface SystemStatus {
  database: 'healthy' | 'degraded' | 'down';
  api: 'healthy' | 'degraded' | 'down';
  frontend: 'healthy' | 'degraded' | 'down';
  brightData: 'healthy' | 'degraded' | 'down';
  lastCheck: string;
}

export default function SystemStatus() {
  const [errors, setErrors] = useState<SystemError[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: 'healthy',
    api: 'healthy', 
    frontend: 'healthy',
    brightData: 'healthy',
    lastCheck: new Date().toISOString()
  });

  // Fetch system health
  const { data: healthData, refetch: refetchHealth } = useQuery({
    queryKey: ['/api/system/health'],
    queryFn: () => fetch('/api/system/health').then(res => res.json()),
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Fetch error logs
  const { data: errorLogs, refetch: refetchErrors } = useQuery({
    queryKey: ['/api/system/errors'],
    queryFn: () => fetch('/api/system/errors').then(res => res.json()),
    refetchInterval: 10000, // Check every 10 seconds
  });

  // Frontend error capture
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const newError: SystemError = {
        id: Date.now().toString(),
        type: 'frontend',
        level: 'error',
        message: event.message,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
        resolved: false,
        count: 1
      };
      
      setErrors(prev => [newError, ...prev.slice(0, 49)]); // Keep last 50 errors
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const newError: SystemError = {
        id: Date.now().toString(),
        type: 'frontend',
        level: 'error',
        message: `Unhandled Promise Rejection: ${event.reason}`,
        timestamp: new Date().toISOString(),
        resolved: false,
        count: 1
      };
      
      setErrors(prev => [newError, ...prev.slice(0, 49)]);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Update system status based on health data
  useEffect(() => {
    if (healthData) {
      setSystemStatus(prev => ({
        ...prev,
        database: healthData.database ? 'healthy' : 'down',
        api: healthData.api ? 'healthy' : 'down',
        brightData: healthData.brightData ? 'healthy' : 'degraded',
        lastCheck: new Date().toISOString()
      }));
    }
  }, [healthData]);

  // Update errors from backend
  useEffect(() => {
    if (errorLogs?.errors) {
      setErrors(prev => {
        const combined = [...errorLogs.errors, ...prev];
        const unique = combined.filter((error, index, arr) => 
          arr.findIndex(e => e.message === error.message && e.type === error.type) === index
        );
        return unique.slice(0, 50);
      });
    }
  }, [errorLogs]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'degraded': return 'text-yellow-600 bg-yellow-50';
      case 'down': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4" />;
      case 'down': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const criticalErrors = errors.filter(e => e.level === 'error' && !e.resolved);
  const warnings = errors.filter(e => e.level === 'warning' && !e.resolved);

  return (
    <PageLayout 
      title="System Status & Bug Tracker" 
      description="Monitor system health, track errors, and manage platform issues"
    >
      <div className="space-y-6">
        {/* Supabase Debug Information */}
        <SupabaseDebug />
        
        {/* Supabase Integration Test */}
        <SupabaseTestComponent />

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Database</CardTitle>
                <Database className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <Badge className={getStatusColor(systemStatus.database)}>
                {getStatusIcon(systemStatus.database)}
                <span className="ml-1 capitalize">{systemStatus.database}</span>
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">API Server</CardTitle>
                <Server className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <Badge className={getStatusColor(systemStatus.api)}>
                {getStatusIcon(systemStatus.api)}
                <span className="ml-1 capitalize">{systemStatus.api}</span>
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Frontend</CardTitle>
                <Globe className="h-4 w-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <Badge className={getStatusColor(systemStatus.frontend)}>
                {getStatusIcon(systemStatus.frontend)}
                <span className="ml-1 capitalize">{systemStatus.frontend}</span>
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Bright Data</CardTitle>
                <Zap className="h-4 w-4 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <Badge className={getStatusColor(systemStatus.brightData)}>
                {getStatusIcon(systemStatus.brightData)}
                <span className="ml-1 capitalize">{systemStatus.brightData}</span>
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Critical Alerts */}
        {criticalErrors.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Critical Issues Detected</AlertTitle>
            <AlertDescription className="text-red-700">
              {criticalErrors.length} critical error{criticalErrors.length !== 1 ? 's' : ''} need immediate attention
            </AlertDescription>
          </Alert>
        )}

        {/* Error Dashboard */}
        <Tabs defaultValue="overview" className="w-full">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="errors">
                Errors ({criticalErrors.length})
              </TabsTrigger>
              <TabsTrigger value="warnings">
                Warnings ({warnings.length})
              </TabsTrigger>
              <TabsTrigger value="logs">All Logs</TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  refetchHealth();
                  refetchErrors();
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setErrors([])}
              >
                Clear Logs
              </Button>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bug className="h-5 w-5 text-red-500" />
                    Critical Errors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{criticalErrors.length}</div>
                  <p className="text-sm text-gray-600">Require immediate attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    Warnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">{warnings.length}</div>
                  <p className="text-sm text-gray-600">Need monitoring</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {Object.values(systemStatus).filter(s => s === 'healthy').length - 1}/4
                  </div>
                  <p className="text-sm text-gray-600">Services operational</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Issues */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Issues</CardTitle>
                <CardDescription>Latest 5 errors and warnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {errors.slice(0, 5).map((error) => (
                    <div key={error.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Badge className={getLevelColor(error.level)}>
                        {error.level.toUpperCase()}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{error.message}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span>{error.type}</span>
                          <Clock className="h-3 w-3" />
                          <span>{new Date(error.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {errors.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No recent issues detected</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="errors" className="space-y-4">
            <div className="space-y-3">
              {criticalErrors.map((error) => (
                <Card key={error.id} className="border-red-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-50 text-red-700">ERROR</Badge>
                        <span className="text-sm font-medium">{error.type.toUpperCase()}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(error.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2">{error.message}</p>
                    {error.stack && (
                      <details className="text-xs text-gray-600">
                        <summary className="cursor-pointer">Stack Trace</summary>
                        <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                          {error.stack}
                        </pre>
                      </details>
                    )}
                    {error.endpoint && (
                      <p className="text-xs text-gray-600 mt-2">Endpoint: {error.endpoint}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
              {criticalErrors.length === 0 && (
                <p className="text-center text-gray-500 py-8">No critical errors found</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="warnings" className="space-y-4">
            <div className="space-y-3">
              {warnings.map((error) => (
                <Card key={error.id} className="border-yellow-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-50 text-yellow-700">WARNING</Badge>
                        <span className="text-sm font-medium">{error.type.toUpperCase()}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(error.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{error.message}</p>
                    {error.endpoint && (
                      <p className="text-xs text-gray-600 mt-2">Endpoint: {error.endpoint}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
              {warnings.length === 0 && (
                <p className="text-center text-gray-500 py-8">No warnings found</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <div className="space-y-2">
              {errors.map((error) => (
                <div key={error.id} className="flex items-center gap-3 p-2 border rounded text-sm">
                  <Badge className={getLevelColor(error.level)}>
                    {error.level.charAt(0).toUpperCase()}
                  </Badge>
                  <span className="w-16 text-xs text-gray-500">{error.type}</span>
                  <span className="flex-1 truncate">{error.message}</span>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(error.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
              {errors.length === 0 && (
                <p className="text-center text-gray-500 py-8">No logs available</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}