import PageLayout from "@/components/layout/PageLayout";
import { FadeIn, StaggeredFadeIn } from "@/components/ui/fade-in";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, TrendingUp, Users, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function StrategicIntelligenceShowcase() {
  const features = [
    {
      icon: Brain,
      title: "Truth Analysis Framework",
      description: "4-layer philosophical analysis using GPT-5 selective reasoning",
      path: "/truth-analysis",
      color: "purple",
      metrics: ["Fact Analysis", "Observation Layer", "Insight Generation", "Human Truth"],
      status: "Enhanced"
    },
    {
      icon: Target,
      title: "DSD Signal Capture",
      description: "Define→Shift→Deliver methodology with automated tagging",
      path: "/capture-tagging",
      color: "blue",
      metrics: ["Life Lens", "Raw Behavior", "Channel Vibes", "Strategic Intel"],
      status: "Enhanced"
    },
    {
      icon: TrendingUp,
      title: "Hypothesis Tracking",
      description: "Prediction validation system for measuring trend accuracy",
      path: "/hypothesis-tracking",
      color: "green",
      metrics: ["Active Predictions", "Validation Rate", "Confidence Scoring", "Outcome Analysis"],
      status: "Enhanced"
    },
    {
      icon: Users,
      title: "Cultural Moments",
      description: "Cross-generational trend detection with viral potential scoring",
      path: "/cultural-moments",
      color: "orange",
      metrics: ["Viral Intensity", "Gen-Z Reach", "Platform Heat", "Cultural Resonance"],
      status: "Enhanced"
    }
  ];

  const capabilities = [
    "GPT-5 Selective Reasoning for 50% cost savings vs GPT-4o",
    "Chrome Extension with sophisticated capture modes",
    "Real-time viral scoring and cultural resonance analysis",
    "Cross-generational trend analysis with platform distribution",
    "Automated DSD brief assembly from tagged captures",
    "Collective intelligence network with anonymized patterns",
    "Truth analysis across Fact→Observation→Insight→Human Truth layers",
    "Google Slides integration for strategic presentations"
  ];

  return (
    <PageLayout 
      title="Strategic Intelligence Platform" 
      description="Comprehensive intelligence platform featuring Truth Analysis Framework, DSD Signal Drop methodology, and Chrome extension integration with TrendFinder-LVUI-Push design"
    >
      <div className="space-y-8">
        {/* Hero Section */}
        <FadeIn>
          <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Strategic Intelligence Platform
              </CardTitle>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Advanced AI-powered content intelligence with sophisticated UI architecture, 
                featuring Truth Analysis Framework, DSD Signal Drop methodology, and real-time cultural moment detection.
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  <Sparkles className="h-3 w-3 mr-1" />
                  GPT-5 Enhanced
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  TrendFinder-LVUI-Push
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Chrome Extension
                </Badge>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  Cultural Analysis
                </Badge>
              </div>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Explore Intelligence Features
              </Button>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Core Features */}
        <div className="space-y-6">
          <FadeIn delay={100}>
            <h2 className="text-2xl font-bold text-center">Core Intelligence Features</h2>
          </FadeIn>
          
          <StaggeredFadeIn
            className="grid gap-6 md:grid-cols-2"
            staggerDelay={100}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.title} href={feature.path}>
                  <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-l-4 border-l-transparent hover:border-l-blue-500 h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-3 rounded-lg bg-${feature.color}-100 group-hover:bg-${feature.color}-200 transition-colors`}>
                            <Icon className={`h-6 w-6 text-${feature.color}-600`} />
                          </div>
                          <div>
                            <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                              {feature.title}
                            </CardTitle>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {feature.status}
                            </Badge>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {feature.metrics.map((metric, idx) => (
                          <div key={idx} className="text-xs text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            {metric}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </StaggeredFadeIn>
        </div>

        {/* Platform Capabilities */}
        <FadeIn delay={300}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span>Platform Capabilities</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {capabilities.map((capability, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                    <span className="text-sm">{capability}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Technical Architecture */}
        <FadeIn delay={400}>
          <Card>
            <CardHeader>
              <CardTitle>Technical Architecture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <h3 className="font-semibold text-blue-600">Frontend</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• TrendFinder-LVUI-Push UI</li>
                    <li>• PageLayout System</li>
                    <li>• FadeIn Animations</li>
                    <li>• StrategicCard Components</li>
                    <li>• Professional Loading States</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-purple-600">Intelligence</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• GPT-5 Selective Reasoning</li>
                    <li>• Truth Analysis Framework</li>
                    <li>• Cultural Moment Detection</li>
                    <li>• Viral Scoring Algorithm</li>
                    <li>• Cross-Gen Analysis</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-green-600">Integration</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Chrome Extension</li>
                    <li>• Google Slides Export</li>
                    <li>• Bright Data Scraping</li>
                    <li>• PostgreSQL Storage</li>
                    <li>• Real-time Analytics</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Call to Action */}
        <FadeIn delay={500}>
          <Card className="text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-4">Ready to explore Strategic Intelligence?</h3>
              <p className="text-muted-foreground mb-6">
                Start with any of the enhanced intelligence features to experience the sophisticated UI and powerful analysis capabilities.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/capture-tagging">
                  <Button variant="outline">DSD Capture</Button>
                </Link>
                <Link href="/truth-analysis">
                  <Button variant="outline">Truth Analysis</Button>
                </Link>
                <Link href="/cultural-moments">
                  <Button variant="outline">Cultural Moments</Button>
                </Link>
                <Link href="/hypothesis-tracking">
                  <Button variant="outline">Hypothesis Tracking</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </PageLayout>
  );
}