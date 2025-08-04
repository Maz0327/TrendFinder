import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Flame, Globe, Star } from "lucide-react";
import type { DashboardStats } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsOverviewProps {
  stats?: DashboardStats;
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Trends",
      value: stats.totalTrends,
      change: "+12%",
      changeLabel: "from last hour",
      icon: TrendingUp,
      bgColor: "bg-blue-100",
      iconColor: "text-primary",
    },
    {
      title: "Viral Potential",
      value: stats.viralPotential,
      change: "+25%",
      changeLabel: "high-scoring content",
      icon: Flame,
      bgColor: "bg-orange-100",
      iconColor: "text-accent",
    },
    {
      title: "Active Sources",
      value: stats.activeSources,
      change: "All platforms online",
      changeLabel: "",
      icon: Globe,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Avg. Score",
      value: stats.avgScore,
      change: "+0.8",
      changeLabel: "from yesterday",
      icon: Star,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`${stat.iconColor} h-6 w-6`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">{stat.change}</span>
              {stat.changeLabel && (
                <span className="text-gray-600 ml-1">{stat.changeLabel}</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
