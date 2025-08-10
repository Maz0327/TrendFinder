import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import StatsOverview from "@/components/dashboard/StatsOverview";
import ContentFilters from "@/components/dashboard/ContentFilters";
import TrendCard from "@/components/dashboard/TrendCard";
import TrendModal from "@/components/dashboard/TrendModal";
import SystemStatus from "@/components/dashboard/SystemStatus";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn, StaggeredFadeIn } from "@/components/ui/fade-in";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { ContentRadarItem, ContentFilters as FilterType } from "@/types";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const [filters, setFilters] = useState<FilterType>({
    category: 'all',
    timeRange: 'hour',
    sortBy: 'viralScore'
  });
  const [selectedTrend, setSelectedTrend] = useState<ContentRadarItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 9;

  const { data: content = [], isLoading: contentLoading, refetch: refetchContent } = useQuery<ContentRadarItem[]>({
    queryKey: ['/api/content', filters],
    queryFn: () => api.get<ContentRadarItem[]>(`/api/content?${new URLSearchParams(filters as any).toString()}`),
  });

  type DashboardStats = { totalCaptures?: number; recentCaptures?: number; trendingTopics?: number };
  
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['/api/stats'],
    queryFn: () => api.get<DashboardStats>('/api/stats'),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleFilterChange = (newFilters: Partial<FilterType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(0);
  };

  const handleTrendClick = (trend: ContentRadarItem) => {
    setSelectedTrend(trend);
    setIsModalOpen(true);
  };

  const paginatedContent = content.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const hasMore = (currentPage + 1) * itemsPerPage < content.length;

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onRefresh={() => refetchContent()} />
      
      <div className="flex">
        <Sidebar filters={filters} onFiltersChange={handleFilterChange} />
        
        <main className="flex-1 lg:ml-64 p-4 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-4 lg:mb-6">
            <div className="lg:col-span-2">
              <StatsOverview stats={stats} />
            </div>
            <div className="lg:col-span-1">
              <SystemStatus />
            </div>
          </div>
          
          <ContentFilters filters={filters} onFiltersChange={handleFilterChange} />
          
          {contentLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
              {[...Array(9)].map((_, i) => (
                <Card key={i} className="animate-fade-in">
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-16 rounded-full" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-14" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : content.length === 0 ? (
            <FadeIn>
              <div className="text-center py-12">
                <div className="text-gray-500">
                  <div className="animate-pulse-scale mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  </div>
                  <h3 className="text-lg font-medium mb-2">No trends found</h3>
                  <p className="text-sm">Try adjusting your filters or running a new scan to fetch fresh content.</p>
                </div>
              </div>
            </FadeIn>
          ) : (
            <>
              <StaggeredFadeIn 
                staggerDelay={75}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8"
              >
                {paginatedContent.map((trend) => (
                  <TrendCard
                    key={trend.id}
                    trend={trend}
                    onClick={() => handleTrendClick(trend)}
                  />
                ))}
              </StaggeredFadeIn>
              
              {hasMore && (
                <FadeIn>
                  <div className="text-center py-8">
                    <Button onClick={handleLoadMore} className="px-6 py-3 hover-lift">
                      <i className="fas fa-plus mr-2"></i>
                      Load More Trends
                    </Button>
                    <p className="text-sm text-gray-600 mt-2">
                      Showing {(currentPage + 1) * itemsPerPage} of {content.length} trends
                    </p>
                  </div>
                </FadeIn>
              )}
            </>
          )}
        </main>
      </div>

      <TrendModal 
        trend={selectedTrend}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
