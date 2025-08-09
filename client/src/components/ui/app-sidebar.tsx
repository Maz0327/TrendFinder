import { useState } from "react"
import { 
  Activity, 
  Radar, 
  Plus, 
  FlaskConical, 
  Settings,
  TrendingUp,
  Search,
  Brain,
  Target
} from "lucide-react"
import { Link, useLocation } from "wouter"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const mainItems = [
  { title: "Today's Briefing", url: "/", icon: Activity },
  { title: "Explore Signals", url: "/explore", icon: Radar },
  { title: "New Signal Capture", url: "/capture", icon: Plus },
  { title: "Strategic Brief Lab", url: "/lab", icon: FlaskConical },
  { title: "Projects", url: "/projects", icon: Target },
]

const analyticsItems = [
  { title: "Trend Analysis", url: "/trends", icon: TrendingUp },
  { title: "Signal Search", url: "/search", icon: Search },
  { title: "AI Insights", url: "/insights", icon: Brain },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const [location] = useLocation()
  const currentPath = location
  const collapsed = state === "collapsed"

  const isActive = (path: string) => currentPath === path

  return (
    <Sidebar
      className={`${collapsed ? "w-14" : "w-60"} bg-sidebar border-sidebar-border transition-smooth`}
      collapsible="icon"
    >
      <SidebarContent className="bg-sidebar">
        {/* Logo Section */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
              <Radar className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">TrendFinder</h1>
                <p className="text-xs text-sidebar-foreground/60">Content Radar</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/80 font-medium">
            Strategic Intelligence
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      href={item.url}
                      className={isActive(item.url) 
                        ? "bg-sidebar-accent text-sidebar-primary font-medium shadow-glow" 
                        : "hover:bg-sidebar-accent/50 transition-smooth"}
                    >
                      <item.icon className="w-4 h-4 text-sidebar-primary" />
                      {!collapsed && <span className="text-sidebar-foreground">{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Analytics Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/80 font-medium">
            Analytics
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      href={item.url}
                      className={isActive(item.url) 
                        ? "bg-sidebar-accent text-sidebar-primary font-medium shadow-glow" 
                        : "hover:bg-sidebar-accent/50 transition-smooth"}
                    >
                      <item.icon className="w-4 h-4 text-sidebar-primary" />
                      {!collapsed && <span className="text-sidebar-foreground">{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link 
                    href="/settings"
                    className={isActive("/settings") 
                      ? "bg-sidebar-accent text-sidebar-primary font-medium shadow-glow" 
                      : "hover:bg-sidebar-accent/50 transition-smooth"}
                  >
                    <Settings className="w-4 h-4 text-sidebar-primary" />
                    {!collapsed && <span className="text-sidebar-foreground">Settings</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}