import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client-new';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Activity,
  Calendar,
  Compass,
  Filter,
  RefreshCw
} from 'lucide-react';

export function InsightsPage() {
  const [timeframe, setTimeframe] = useState('7d');
  const [selectedProject, setSelectedProject] = useState('');

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['workspace-analytics', timeframe, selectedProject],
    queryFn: () => apiClient.analytics.getInsights({ timeframe, projectId: selectedProject })
  });

  // Fetch projects for filter
  const { data: projects } = useQuery({
    queryKey: ['workspace-projects'],
    queryFn: () => apiClient.workspace.getProjects()
  });

  const timeframeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

  const insights = [
    {
      title: 'Content Velocity',
      description: 'Rate of content capture and processing',
      value: analytics?.contentVelocity || 0,
      unit: 'captures/week',
      trend: '+12%',
      icon: Activity,
      color: 'text-blue-600'
    },
    {
      title: 'Signal Quality Score',
      description: 'Average quality of captured signals',
      value: analytics?.signalQuality || 0,
      unit: '%',
      trend: '+5%',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Brief Generation Rate',
      description: 'Briefs created from captured content',
      value: analytics?.briefRate || 0,
      unit: 'briefs/month',
      trend: '+8%',
      icon: BarChart3,
      color: 'text-purple-600'
    },
    {
      title: 'Analysis Depth',
      description: 'Average depth of content analysis',
      value: analytics?.analysisDepth || 0,
      unit: 'score',
      trend: '+3%',
      icon: Compass,
      color: 'text-orange-600'
    }
  ];

  const trendingTopics = analytics?.trendingTopics || [
    { topic: 'AI Technology', mentions: 24, growth: '+45%' },
    { topic: 'Social Commerce', mentions: 18, growth: '+32%' },
    { topic: 'Sustainability', mentions: 15, growth: '+28%' },
    { topic: 'Remote Work', mentions: 12, growth: '+15%' },
    { topic: 'Digital Health', mentions: 9, growth: '+22%' }
  ];

  const contentSources = analytics?.contentSources || [
    { source: 'Social Media', percentage: 45, count: 120 },
    { source: 'News Articles', percentage: 30, count: 80 },
    { source: 'Blog Posts', percentage: 15, count: 40 },
    { source: 'Videos', percentage: 10, count: 25 }
  ];

  const getSourceColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-yellow-500',
      'bg-purple-500',
      'bg-red-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Insights & Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Deep analysis of your content intelligence patterns
          </p>
        </div>
        
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeframeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-projects">All projects</SelectItem>
                {projects?.map((project: any) => (
                  <SelectItem key={project.id} value={String(project.id)}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {insights.map((insight) => {
          const Icon = insight.icon;
          return (
            <Card key={insight.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {insight.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${insight.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsLoading ? '...' : `${insight.value}${insight.unit.startsWith('%') ? '%' : ''}`}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {insight.description}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-xs text-green-600 font-medium">
                    {insight.trend}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">
                    vs last period
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trending Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Trending Topics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trendingTopics.map((topic, index) => (
                <div key={topic.topic} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">{topic.topic}</span>
                      <Badge variant="outline" className="text-xs">
                        {topic.mentions} mentions
                      </Badge>
                    </div>
                    <div className="flex items-center mt-1">
                      <div className="h-1 bg-muted rounded-full flex-1 mr-2">
                        <div 
                          className={`h-1 rounded-full ${getSourceColor(index)}`}
                          style={{ width: `${Math.min(topic.mentions / Math.max(...trendingTopics.map(t => t.mentions)) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-green-600 font-medium">
                        {topic.growth}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Content Sources</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contentSources.map((source, index) => (
                <div key={source.source} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{source.source}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {source.count} items
                      </span>
                      <span className="text-sm font-medium">
                        {source.percentage}%
                      </span>
                    </div>
                  </div>
                  <Progress value={source.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Performance Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {analytics?.totalCaptures || 0}
              </div>
              <h4 className="font-medium mb-1">Total Captures</h4>
              <p className="text-sm text-muted-foreground">
                Content pieces analyzed
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {analytics?.avgProcessingTime || 0}s
              </div>
              <h4 className="font-medium mb-1">Avg Processing Time</h4>
              <p className="text-sm text-muted-foreground">
                Per content analysis
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {analytics?.insightAccuracy || 0}%
              </div>
              <h4 className="font-medium mb-1">Insight Accuracy</h4>
              <p className="text-sm text-muted-foreground">
                Based on validation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}