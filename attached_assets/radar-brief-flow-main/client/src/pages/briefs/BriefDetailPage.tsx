import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit, Share, Download, Eye } from "lucide-react";

export default function BriefDetailPage() {
  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-large-title font-semibold text-foreground">Brand Campaign Brief</h1>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">Active</Badge>
            <span className="text-sm text-muted-foreground">Created 3 days ago</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button variant="outline" size="sm">
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit Brief
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="group hover:shadow-apple-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <CardTitle>Define</CardTitle>
              <CardDescription>Core objectives and requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Primary Objective</h4>
                <p className="text-sm text-muted-foreground">
                  Launch our new product line with a focus on sustainability and innovation.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Target Audience</h4>
                <p className="text-sm text-muted-foreground">
                  Environmentally conscious millennials and Gen Z consumers.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-apple-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <CardTitle>Shift</CardTitle>
              <CardDescription>Strategic positioning and messaging</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Key Message</h4>
                <p className="text-sm text-muted-foreground">
                  "Innovation meets sustainability in every product we create."
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-apple-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <CardTitle>Deliver</CardTitle>
              <CardDescription>Execution strategy and deliverables</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Campaign Elements</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">Social Media</Badge>
                  <Badge variant="outline">Video Content</Badge>
                  <Badge variant="outline">Influencer Partnerships</Badge>
                  <Badge variant="outline">PR Campaign</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="group hover:shadow-apple-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Brief Creation</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Content Development</p>
                    <p className="text-xs text-muted-foreground">In Progress</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-muted rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Campaign Launch</p>
                    <p className="text-xs text-muted-foreground">Upcoming</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-apple-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <CardTitle>Team</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium">JD</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">John Doe</p>
                    <p className="text-xs text-muted-foreground">Creative Director</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium">JS</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Jane Smith</p>
                    <p className="text-xs text-muted-foreground">Content Manager</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
