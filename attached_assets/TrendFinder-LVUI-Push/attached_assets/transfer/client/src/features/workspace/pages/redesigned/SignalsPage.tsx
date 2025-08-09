import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client-new';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Zap, 
  ExternalLink,
  Calendar,
  Tag
} from 'lucide-react';

type CaptureStatus = 'capture' | 'potential' | 'signal' | 'validated';

export function SignalsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaptureStatus | ''>('');

  // Fetch captures/signals
  const { data: captures, isLoading: capturesLoading } = useQuery({
    queryKey: ['workspace-captures'],
    queryFn: () => apiClient.captures.getAll()
  });

  // Fetch projects for filter
  const { data: projects } = useQuery({
    queryKey: ['workspace-projects'],
    queryFn: () => apiClient.workspace.getProjects()
  });

  // Filter captures
  const filteredCaptures = captures?.filter((capture: any) => {
    const matchesSearch = !searchQuery || 
      capture.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      capture.content?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProject = !selectedProject || selectedProject === 'all-projects' || 
      capture.projectId === selectedProject;
    
    const matchesStatus = !statusFilter || statusFilter === 'all-statuses' || 
      capture.status === statusFilter;
    
    return matchesSearch && matchesProject && matchesStatus;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'signal': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'potential': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Signals</h1>
        <p className="text-muted-foreground mt-2">
          Browse and analyze your captured content signals
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search signals..."
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
                {projects?.map((project: any) => (
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
      {capturesLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-6 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCaptures.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No signals found</h3>
            <p className="text-muted-foreground">
              {captures?.length === 0 
                ? "You haven't captured any content yet. Start by capturing your first signal."
                : "Try adjusting your filters to see more results."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredCaptures.map((capture: any) => (
            <Card key={capture.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">
                        {capture.title || 'Untitled Signal'}
                      </h3>
                      <Badge className={getStatusColor(capture.status)}>
                        {capture.status}
                      </Badge>
                    </div>
                    
                    {capture.content && (
                      <p className="text-muted-foreground line-clamp-2">
                        {capture.content}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {capture.sourceUrl && (
                        <div className="flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          <span className="truncate max-w-[200px]">
                            {new URL(capture.sourceUrl).hostname}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(capture.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {capture.tags && capture.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          <span>{capture.tags.length} tags</span>
                        </div>
                      )}
                    </div>
                    
                    {capture.tags && capture.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {capture.tags.slice(0, 3).map((tag: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {capture.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{capture.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {capture.sourceUrl && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={capture.sourceUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}