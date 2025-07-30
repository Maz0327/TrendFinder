import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Play, 
  CheckCircle,
  FolderOpen,
  Chrome,
  Brain,
  FileText,
  Target
} from "lucide-react";

interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  position?: "top" | "bottom" | "left" | "right";
  icon?: React.ComponentType<{ className?: string }>;
  content?: ReactNode;
}

interface TourContextType {
  isActive: boolean;
  currentStep: number;
  steps: TourStep[];
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
}

const TourContext = createContext<TourContextType | null>(null);

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Content Radar",
    description: "Your strategic intelligence platform for content analysis and brief generation.",
    icon: Target,
    content: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Content Radar helps strategists monitor trends, analyze content, and create professional briefs. 
          Let's take a quick tour to get you started.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2 text-sm">
            <FolderOpen className="h-4 w-4 text-blue-500" />
            <span>Project Management</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Chrome className="h-4 w-4 text-green-500" />
            <span>Chrome Extension</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Brain className="h-4 w-4 text-purple-500" />
            <span>AI Analysis</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <FileText className="h-4 w-4 text-orange-500" />
            <span>Brief Generation</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "projects",
    title: "Projects Hub",
    description: "Organize your content research into strategic projects.",
    target: "[data-tour='projects']",
    position: "bottom",
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Projects are the foundation of your workflow. Each project contains:
        </p>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• Captured content from web browsing</li>
          <li>• AI-powered analysis and insights</li>
          <li>• Professional strategic briefs</li>
        </ul>
      </div>
    )
  },
  {
    id: "chrome-extension",
    title: "Chrome Extension",
    description: "Capture content while browsing with smart overlay modes.",
    target: "[data-tour='extension-status']",
    position: "bottom",
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          The Chrome extension enables seamless content capture:
        </p>
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center space-x-2 text-sm">
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
              Precision Mode
            </Badge>
            <span className="text-xs text-muted-foreground">Cmd+Shift+S</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
              Context Mode
            </Badge>
            <span className="text-xs text-muted-foreground">Cmd+Shift+C</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "analysis",
    title: "Truth Analysis Framework",
    description: "Four-layer AI analysis: Fact → Observation → Insight → Human Truth",
    target: "[data-tour='analysis']",
    position: "bottom",
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Our proprietary analysis framework provides strategic depth:
        </p>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-blue-600">1</span>
            </div>
            <span><strong>Fact:</strong> What happened</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-green-600">2</span>
            </div>
            <span><strong>Observation:</strong> What it means</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-purple-600">3</span>
            </div>
            <span><strong>Insight:</strong> Why it matters</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-orange-600">4</span>
            </div>
            <span><strong>Human Truth:</strong> Strategic implications</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "brief-builder",
    title: "Brief Builder",
    description: "Create professional strategic briefs with drag-and-drop interface.",
    target: "[data-tour='brief-builder']",
    position: "bottom",
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Transform your research into professional deliverables:
        </p>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• Drag captured content into brief sections</li>
          <li>• Jimmy John's format templates</li>
          <li>• Export to Markdown, PDF, or Slides</li>
          <li>• AI-assisted brief generation</li>
        </ul>
      </div>
    )
  },
  {
    id: "complete",
    title: "You're Ready!",
    description: "Start by creating your first project and installing the Chrome extension.",
    icon: CheckCircle,
    content: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          You now understand the core workflow. Here's what to do next:
        </p>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">1</span>
            </div>
            <span>Create your first project</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">2</span>
            </div>
            <span>Install the Chrome extension</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">3</span>
            </div>
            <span>Start capturing content</span>
          </div>
        </div>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <p className="text-xs text-blue-700">
              💡 <strong>Pro Tip:</strong> Use Tab key to toggle between capture modes while browsing
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
];

export function TourProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(false);
  const { user } = useAuth();

  // Check if user has seen tour (using localStorage for now)
  useEffect(() => {
    if (user) {
      const tourCompleted = localStorage.getItem(`tour-completed-${user.id}`);
      setHasSeenTour(!!tourCompleted);
    }
  }, [user]);

  const startTour = () => {
    setIsActive(true);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    setIsActive(false);
    if (user) {
      localStorage.setItem(`tour-completed-${user.id}`, "skipped");
      setHasSeenTour(true);
    }
  };

  const completeTour = () => {
    setIsActive(false);
    if (user) {
      localStorage.setItem(`tour-completed-${user.id}`, "completed");
      setHasSeenTour(true);
    }
  };

  const contextValue: TourContextType = {
    isActive,
    currentStep,
    steps: tourSteps,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
  };

  return (
    <TourContext.Provider value={contextValue}>
      {children}
      <TourModal />
      <WelcomeModal hasSeenTour={hasSeenTour} />
    </TourContext.Provider>
  );
}

function WelcomeModal({ hasSeenTour }: { hasSeenTour: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { startTour } = useTour();

  useEffect(() => {
    if (user && !hasSeenTour) {
      // Show welcome modal after a brief delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, hasSeenTour]);

  const handleStartTour = () => {
    setIsOpen(false);
    startTour();
  };

  const handleSkip = () => {
    setIsOpen(false);
    if (user) {
      localStorage.setItem(`tour-completed-${user.id}`, "skipped");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Target className="h-6 w-6 text-primary" />
            <DialogTitle>Welcome to Content Radar!</DialogTitle>
          </div>
          <DialogDescription>
            Ready to master strategic content intelligence? Let's show you around.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4 text-center">
                <Play className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium text-blue-900">Take the Tour</h3>
                <p className="text-xs text-blue-700 mt-1">5-minute guided walkthrough</p>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="p-4 text-center">
                <ArrowRight className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">Explore Freely</h3>
                <p className="text-xs text-gray-700 mt-1">Jump right in</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleSkip}>
            Skip for now
          </Button>
          <Button onClick={handleStartTour}>
            <Play className="h-4 w-4 mr-2" />
            Start Tour
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TourModal() {
  const { isActive, currentStep, steps, nextStep, prevStep, skipTour } = useTour();
  
  if (!isActive) return null;
  
  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  
  return (
    <Dialog open={isActive} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {step.icon && <step.icon className="h-5 w-5 text-primary" />}
              <DialogTitle>{step.title}</DialogTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {currentStep + 1} of {steps.length}
              </Badge>
              <Button variant="ghost" size="sm" onClick={skipTour}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DialogDescription>{step.description}</DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {step.content}
        </div>

        <DialogFooter>
          <div className="flex justify-between items-center w-full">
            <Button variant="ghost" onClick={skipTour}>
              Skip Tour
            </Button>
            
            <div className="flex space-x-2">
              {!isFirstStep && (
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
              <Button onClick={nextStep}>
                {isLastStep ? "Get Started" : "Next"}
                {!isLastStep && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}