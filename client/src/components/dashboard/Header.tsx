import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Play, Search, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  onRefresh: () => void;
}

export default function Header({ onRefresh }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: scheduleStatus } = useQuery({
    queryKey: ['/api/schedule/status'],
    queryFn: api.getScheduleStatus,
    refetchInterval: 5000,
  });

  const runScanMutation = useMutation({
    mutationFn: api.runScan,
    onSuccess: (result) => {
      toast({
        title: "Scan completed",
        description: `Processed ${result.itemsProcessed} items${result.errors.length > 0 ? ` with ${result.errors.length} errors` : ''}`,
        variant: result.success ? "default" : "destructive",
      });
      onRefresh();
    },
    onError: () => {
      toast({
        title: "Scan failed",
        description: "Unable to run content scan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log("Search:", searchQuery);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-radar-chart text-white text-sm"></i>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Content Radar</h1>
            </div>
            <div className="hidden md:flex items-center space-x-2 ml-8">
              <Badge variant={scheduleStatus?.isActive ? "default" : "secondary"} className="bg-green-100 text-green-800">
                {scheduleStatus?.isActive ? "Live" : "Paused"}
              </Badge>
              <span className="text-sm text-gray-600">Last scan: 2 minutes ago</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative hidden lg:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search trends, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-80"
              />
            </form>
            
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </Button>
            
            <Button 
              onClick={() => runScanMutation.mutate()}
              disabled={runScanMutation.isPending}
              className="flex items-center space-x-2"
            >
              {runScanMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span>{runScanMutation.isPending ? "Scanning..." : "Run Scan"}</span>
            </Button>
            
            <Avatar className="h-8 w-8">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
