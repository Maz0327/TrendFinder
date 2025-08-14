import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Zap, Clock, ArrowUpRight } from "lucide-react";

export default function MomentsRadarPage() {
  const moments = [
    {
      id: 1,
      title: "Sustainable Fashion Trend",
      intensity: 85,
      recency: "2 hours ago",
      category: "Fashion",
      captures: 234,
      trend: "rising"
    },
    {
      id: 2,
      title: "AI Art Controversy",
      intensity: 92,
      recency: "4 hours ago",
      category: "Technology",
      captures: 456,
      trend: "stable"
    },
    {
      id: 3,
      title: "Plant-based Diet Movement",
      intensity: 78,
      recency: "6 hours ago",
      category: "Health",
      captures: 189,
      trend: "rising"
    }
  ];

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 90) return "text-red-500";
    if (intensity >= 70) return "text-yellow-500";
    return "text-primary";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "rising": return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "stable": return <div className="w-4 h-4 bg-yellow-500 rounded-full" />;
      default: return <div className="w-4 h-4 bg-muted rounded-full" />;
    }
  };

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-large-title font-semibold text-foreground">Moments Radar</h1>
        <p className="text-muted-foreground">Track cultural moments and trending topics in real-time</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="group hover:shadow-apple-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Intensity</CardTitle>
            <Zap className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500 font-medium">+3</span> in the last hour
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-apple-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rising Trends</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 font-medium">+2</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-apple-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Captures</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,879</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-500 font-medium">+156</span> today
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="group hover:shadow-apple-lg transition-all duration-300 hover:-translate-y-1">
        <CardHeader>
          <CardTitle>Active Moments</CardTitle>
          <CardDescription>Cultural moments with high intensity and engagement</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {moments.map((moment) => (
            <div key={moment.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getTrendIcon(moment.trend)}
                  <div>
                    <h4 className="font-medium">{moment.title}</h4>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">{moment.category}</Badge>
                      <span>•</span>
                      <span>{moment.captures} captures</span>
                      <span>•</span>
                      <span>{moment.recency}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className={`text-lg font-bold ${getIntensityColor(moment.intensity)}`}>
                    {moment.intensity}
                  </div>
                  <div className="text-xs text-muted-foreground">intensity</div>
                </div>
                <Button variant="ghost" size="sm">
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="group hover:shadow-apple-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader>
            <CardTitle>Intensity Heatmap</CardTitle>
            <CardDescription>Visual representation of moment intensity over time</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Interactive heatmap visualization</p>
              <p className="text-sm">Coming in Phase 2</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-apple-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader>
            <CardTitle>Trending Categories</CardTitle>
            <CardDescription>Most active content categories right now</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {["Technology", "Fashion", "Health", "Entertainment", "Sports"].map((category, index) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm font-medium">{category}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${Math.max(20, 100 - index * 15)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground w-8">
                    {100 - index * 15}%
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
