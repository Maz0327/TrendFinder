import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, Eye, ArrowUpRight } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    { title: "Total Captures", value: "1,234", change: "+12%", icon: Eye },
    { title: "Active Moments", value: "56", change: "+8%", icon: TrendingUp },
    { title: "Team Members", value: "12", change: "+2", icon: Users },
    { title: "Analytics", value: "98.5%", change: "+0.3%", icon: BarChart3 },
  ];

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-large-title font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Monitor your content performance and team activity</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={stat.title} className="group hover:shadow-apple-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-primary font-medium">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="group hover:shadow-apple-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">New capture added</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="group hover:shadow-apple-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="ghost">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Create New Brief
            </Button>
            <Button className="w-full justify-start" variant="ghost">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              View Captures
            </Button>
            <Button className="w-full justify-start" variant="ghost">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Monitor Moments
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}