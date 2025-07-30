import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
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
    <nav className="flex items-center space-x-6">
      {navigation.map((item) => {
        const isActive = location === item.href;
        const Icon = item.icon;
        
        return (
          <Link key={item.name} href={item.href}>
            <a
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </a>
          </Link>
        );
      })}
      
      {/* Chrome Extension Indicator */}
      <div className="flex items-center space-x-2 px-3 py-2 text-sm">
        <Puzzle className="h-4 w-4 text-green-600" />
        <span className="text-gray-600">Extension Active</span>
      </div>
    </nav>
  );
}