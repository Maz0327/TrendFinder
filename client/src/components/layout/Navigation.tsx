import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Globe,
  Brain,
  FileText,
  Settings,
  Puzzle,
  TrendingUp
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Intelligence", href: "/intelligence", icon: Globe },
  { name: "Analysis", href: "/analysis", icon: Brain },
  { name: "Briefs", href: "/briefs", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="hidden lg:flex items-center space-x-4">
      {navigation.map((item) => {
        const isActive = location === item.href;
        const Icon = item.icon;
        
        return (
          <Link key={item.name} href={item.href}>
            <div
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden xl:inline">{item.name}</span>
            </div>
          </Link>
        );
      })}
      
      {/* Chrome Extension Status */}
      <div className="ml-4 pl-4 border-l border-gray-200">
        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
          <Puzzle className="h-3 w-3 mr-1" />
          <span className="hidden xl:inline">Extension</span>
        </Badge>
      </div>
    </nav>
  );
}