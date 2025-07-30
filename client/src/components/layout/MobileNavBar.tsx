import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Home,
  Globe,
  Brain,
  FileText,
  Settings
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Intelligence", href: "/intelligence", icon: Globe },
  { name: "Analysis", href: "/analysis", icon: Brain },
  { name: "Briefs", href: "/briefs", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function MobileNavBar() {
  const [location] = useLocation();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <nav className="flex items-center justify-around px-2 py-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg min-w-[60px] transition-colors",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}