// Today's Briefing - Phase 2 UI/UX
// Daily insights and trending signals

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, Eye, Clock, Sparkles } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export function TodaysBriefing() {
  // Fetch today's trending content
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['workspace', 'stats'],
    queryFn: () => apiClient.workspace.getStats(),
  });

  // Mock trending data for now - will connect to real APIs
  const trendingTopics = [
    { topic: 'AI Productivity Tools', growth: '+34%', mentions: 1234 },
    { topic: 'Sustainable Fashion', growth: '+28%', mentions: 892 },
    { topic: 'Remote Work Culture', growth: '+22%', mentions: 756 },
  ];

  if (statsLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Today's Briefing
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Captures</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCaptures || 0}</div>
            <p className="text-xs text-muted-foreground">Across all projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validated Signals</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.capturesByStatus?.validated || 0}</div>
            <p className="text-xs text-muted-foreground">Ready for briefs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProjects || 0}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+18%</div>
            <p className="text-xs text-muted-foreground">Signal growth</p>
          </CardContent>
        </Card>
      </div>

      {/* Trending Topics */}
      <Card>
        <CardHeader>
          <CardTitle>Trending Topics</CardTitle>
          <CardDescription>What's gaining traction today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trendingTopics.map((topic, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex-1">
                  <h4 className="font-medium">{topic.topic}</h4>
                  <p className="text-sm text-gray-500">{topic.mentions} mentions</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-semibold text-green-600">{topic.growth}</span>
                  <p className="text-xs text-gray-500">vs yesterday</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Insights</CardTitle>
          <CardDescription>Strategic observations from your recent captures</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              <strong>Cultural Shift Detected:</strong> There's a growing intersection between sustainability 
              messaging and AI technology adoption. Brands successfully combining these narratives are seeing 
              2.3x higher engagement rates. Consider exploring this angle for upcoming campaigns.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}