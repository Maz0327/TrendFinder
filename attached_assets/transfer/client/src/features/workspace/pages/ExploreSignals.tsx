// Explore Signals - Phase 2 UI/UX
// Browse and analyze captured signals

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, ExternalLink, ArrowUpRight, Clock } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useProjectCaptures } from '@/features/captures/hooks/useCaptures';
import type { CaptureStatus } from '@/features/captures/types';

export function ExploreSignals() {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<CaptureStatus | ''>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ['workspace', 'projects'],
    queryFn: () => apiClient.workspace.getProjects(),
  });

  // Fetch captures
  const { data: captures = [], isLoading } = useProjectCaptures(
    selectedProject,
    statusFilter as CaptureStatus
  );

  // Filter captures based on search
  const filteredCaptures = captures.filter(capture => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      capture.title?.toLowerCase().includes(searchLower) ||
      capture.content?.toLowerCase().includes(searchLower) ||
      capture.url?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'capture': return 'bg-gray-100 text-gray-800';
      case 'potential': return 'bg-blue-100 text-blue-800';
      case 'signal': return 'bg-purple-100 text-purple-800';
      case 'validated': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Explore Signals</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Browse and analyze your captured content
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search captures..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-projects">All projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={String(project.id)}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as CaptureStatus | '')}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-statuses">All statuses</SelectItem>
                <SelectItem value="capture">Capture</SelectItem>
                <SelectItem value="potential">Potential</SelectItem>
                <SelectItem value="signal">Signal</SelectItem>
                <SelectItem value="validated">Validated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading captures...</p>
        </div>
      ) : filteredCaptures.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">No captures found. Try adjusting your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredCaptures.map((capture) => (
            <Card key={capture.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{capture.title || 'Untitled'}</h3>
                      <Badge className={getStatusColor(capture.status || 'capture')}>
                        {capture.status || 'capture'}
                      </Badge>
                    </div>
                    {capture.content && (
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                        {capture.content}
                      </p>
                    )}
                    {capture.truthAnalysis?.analysis && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mt-2">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          Truth Analysis
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          {capture.truthAnalysis.analysis}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {capture.createdAt ? new Date(capture.createdAt).toLocaleDateString() : 'Unknown date'}
                      </span>
                      {capture.detectedPlatform && (
                        <Badge variant="outline">{capture.detectedPlatform}</Badge>
                      )}
                    </div>
                  </div>
                  {capture.url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(capture.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}