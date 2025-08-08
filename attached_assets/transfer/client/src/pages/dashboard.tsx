import { useState } from "react";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { SignalsSidebar } from "@/components/signals-sidebar";
import { TodaysBriefing } from "@/components/todays-briefing";
import { ExploreSignals } from "@/components/explore-signals";
import { NewSignalCapture } from "@/components/new-signal-capture";
import { StrategicBriefLab } from "@/components/strategic-brief-lab";
import BriefBuilder from "./brief-builder";
import { ManageHub } from "@/components/manage-hub";
import { AdminDashboard } from "@/components/admin-dashboard";
import { FeedbackWidget } from "@/components/feedback-widget";
import { FeedsHub } from "@/components/feeds-hub";
import { ProjectGallery } from "@/components/project-gallery";
import { MyWorkspaces } from "@/components/my-workspaces";
import { BriefTemplateEngine } from "@/components/brief-template-engine";
import { MobileNav } from "@/components/ui/mobile-nav";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Brain, Bell, User, Home, Search, Plus, Target, Settings, ChevronRight, BarChart3, ChevronLeft, Menu, X, FolderOpen } from "lucide-react";
import { Link, useLocation } from "wouter";

interface DashboardProps {
  user: { id: number; email: string };
  onLogout: () => void;
  onPageChange?: (page: string) => void;
  currentPage?: string;
}

export default function Dashboard({ user, onLogout, onPageChange, currentPage }: DashboardProps) {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState(currentPage || "workspaces");
  
  // Update active tab when route changes
  React.useEffect(() => {
    const pathToTab: Record<string, string> = {
      '/dashboard': 'briefing',
      '/capture': 'capture',
      '/projects': 'projects',
      '/workspaces': 'workspaces',
      '/explore': 'explore',
      '/brief': 'brief',
      '/manage': 'manage',
      '/admin': 'admin'
    };
    
    const newTab = pathToTab[location] || currentPage || 'workspaces';
    setActiveTab(newTab);
  }, [location, currentPage]);
  const [activeSubTab, setActiveSubTab] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Notify parent component of page changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onPageChange?.(tab);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      onLogout();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      onLogout(); // Logout anyway
    }
  };

  // Navigation handlers
  const handleNavigateToExplore = () => {
    setActiveTab("explore");
    setActiveSubTab("trending");
  };
  const handleNavigateToCapture = () => setActiveTab("capture");
  const handleNavigateToBrief = () => setActiveTab("brief");
  const handleNavigateToManage = () => setActiveTab("manage");
  const handleNavigateToTrending = (platform?: string) => {
    handleTabChange("explore");
    setActiveSubTab("trending");
    // TODO: Could add platform filtering here if needed
  };

  // Get user role from auth API
  const { data: currentUser } = useQuery({ 
    queryKey: ['/api/auth/me'],
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });
  
  const isAdmin = (currentUser as any)?.role === 'admin';

  // Sidebar navigation items - WORKSPACE-FIRST DESIGN
  const navigationItems = [
    {
      id: "briefing",
      label: "Today's Briefing",
      icon: Home,
      subItems: []
    },
    {
      id: "workspaces",
      label: "My Workspaces",
      icon: FolderOpen,
      subItems: []
    },
    {
      id: "capture",
      label: "Quick Capture",
      icon: Plus,
      subItems: []
    },
    {
      id: "brief",
      label: "Strategic Brief Lab",
      icon: Target,
      subItems: [
        { id: "builder", label: "Brief Builder" },
        { id: "cohorts", label: "Cohort Builder" },
        { id: "framework", label: "Define → Shift → Deliver" }
      ]
    },
    {
      id: "manage",
      label: "Manage",
      icon: Settings,
      subItems: [
        { id: "dashboard", label: "Dashboard" },
        { id: "sources", label: "Sources" },
        { id: "reports", label: "Daily Reports" },
        { id: "insights", label: "Audience Insights" }
      ]
    },
    ...(isAdmin ? [{
      id: "admin",
      label: "Admin Panel",
      icon: BarChart3,
      subItems: [
        { id: "analytics", label: "User Analytics" },
        { id: "feedback", label: "Feedback Management" },
        { id: "performance", label: "System Performance" }
      ]
    }] : [])
  ];

  return (
    <div className="h-screen bg-gray-50 flex flex-col mobile-safe">
      {/* Mobile-Responsive Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 sm:px-6 sm:py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            <span className="font-semibold text-gray-900 text-sm sm:text-base">Strategist</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="p-2">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="p-2">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden mobile-safe pb-16 sm:pb-0">
        {/* Mobile Menu Overlay */}
        {isMobile && mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          ${isMobile ? 'fixed' : 'relative'} 
          ${isMobile && !mobileMenuOpen ? '-translate-x-full' : 'translate-x-0'}
          ${isMobile ? 'z-50' : ''}
          ${sidebarCollapsed && !isMobile ? 'w-16' : isMobile ? 'w-80' : 'w-64'}
          bg-white border-r border-gray-200 transition-all duration-300
          ${isMobile ? 'h-full' : ''}
        `}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <h2 className="text-sm font-semibold text-gray-900">Navigation</h2>
              )}
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-1"
                >
                  <ChevronLeft className={`h-4 w-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
                </Button>
              )}
            </div>
          </div>
          
          <nav className="p-2 space-y-1">
            {navigationItems.map((item) => (
              <div key={item.id}>
                <Link href={`/${item.id === 'briefing' ? 'dashboard' : item.id}`}>
                  <Button
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className={`w-full justify-between ${sidebarCollapsed && !isMobile ? 'px-2' : 'px-3'}`}
                    onClick={() => {
                      if (isMobile) setMobileMenuOpen(false);
                    }}
                  >
                    <div className="flex items-center">
                      <item.icon className={`h-4 w-4 ${sidebarCollapsed && !isMobile ? '' : 'mr-2'}`} />
                      {(!sidebarCollapsed || isMobile) && item.label}
                    </div>
                    {/* Show chevron for items with sub-menus on desktop only */}
                    {item.subItems.length > 0 && !isMobile && !sidebarCollapsed && (
                      <ChevronRight className={`h-4 w-4 transition-transform ${activeTab === item.id ? 'rotate-90' : ''}`} />
                    )}
                  </Button>
                </Link>
                
                {/* Sub-navigation */}
                {item.subItems.length > 0 && activeTab === item.id && (!sidebarCollapsed || isMobile) && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Button
                        key={subItem.id}
                        variant={activeSubTab === subItem.id ? "secondary" : "ghost"}
                        size="sm"
                        className="w-full justify-start text-xs"
                        onClick={() => {
                          setActiveSubTab(subItem.id);
                          if (isMobile) setMobileMenuOpen(false);
                        }}
                      >
                        {subItem.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden min-w-0">
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 min-w-0">
            {/* Today's Briefing temporarily commented out per user request
            {activeTab === "briefing" && (
              <TodaysBriefing 
                activeSubTab=""
                onNavigateToExplore={handleNavigateToExplore}
                onNavigateToCapture={handleNavigateToCapture}
                onNavigateToBrief={handleNavigateToBrief}
                onNavigate={(tab, subTab) => {
                  setActiveTab(tab);
                  if (subTab) setActiveSubTab(subTab);
                }}
              />
            )}
            */}
            
            {activeTab === "feeds" && (
              <FeedsHub 
                activeSubTab={activeSubTab}
                onNavigateToCapture={handleNavigateToCapture}
                onNavigateToBrief={handleNavigateToBrief}
              />
            )}
            
            {activeTab === "explore" && (
              <ExploreSignals 
                activeSubTab={activeSubTab}
              />
            )}
            
            {activeTab === "capture" && (
              <NewSignalCapture />
            )}
            
            {activeTab === "projects" && (
              <ProjectGallery />
            )}

            {activeTab === "workspaces" && (
              <MyWorkspaces />
            )}
            
            {activeTab === "brief" && activeSubTab === "builder" && (
              <BriefBuilder />
            )}
            
            {activeTab === "brief" && activeSubTab === "template" && (
              <BriefTemplateEngine />
            )}
            
            {activeTab === "brief" && activeSubTab !== "builder" && activeSubTab !== "template" && (
              <StrategicBriefLab 
                activeSubTab={activeSubTab}
              />
            )}
            
            {activeTab === "manage" && (
              <ManageHub 
                activeSubTab={activeSubTab}
              />
            )}
            
            {activeTab === "admin" && (
              <AdminDashboard />
            )}
          </main>
          

        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setActiveSubTab("");
          setMobileMenuOpen(false);
        }}
      />
      
      {/* Feedback Widget */}
      <FeedbackWidget />
    </div>
  );
}