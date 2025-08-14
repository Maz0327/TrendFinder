import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Download, FileArchive, Folder } from "lucide-react";
import JSZip from "jszip";

const DownloadZip = () => {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");

  useEffect(() => {
    document.title = "Download ZIP — Content Radar";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Download the complete Content Radar project as a ZIP file.');
  }, []);

  // Collect files using import.meta.glob with query syntax
  const srcFiles = import.meta.glob("/src/**/*", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
  const clientFiles = import.meta.glob("/client/**/*", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
  const sharedFiles = import.meta.glob("/shared/**/*", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
  const supabaseFiles = import.meta.glob("/supabase/**/*", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
  const publicFiles = import.meta.glob("/public/**/*", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
  
  // Config files
  const configFiles = import.meta.glob([
    "/index.html",
    "/README.md", 
    "/package.json",
    "/tailwind.config.ts",
    "/vite.config.ts",
    "/eslint.config.js",
    "/tsconfig.json",
    "/tsconfig.app.json", 
    "/tsconfig.node.json",
    "/postcss.config.js",
    "/components.json",
    "/.env.example"
  ], { query: "?raw", import: "default", eager: true }) as Record<string, string>;

  console.log("Files found:");
  console.log("srcFiles:", Object.keys(srcFiles).length);
  console.log("clientFiles:", Object.keys(clientFiles).length);
  console.log("sharedFiles:", Object.keys(sharedFiles).length);
  console.log("supabaseFiles:", Object.keys(supabaseFiles).length);
  console.log("publicFiles:", Object.keys(publicFiles).length);
  console.log("configFiles:", Object.keys(configFiles).length);

  const buildZip = async () => {
    console.log("Starting ZIP creation...");
    setBusy(true);
    setProgress(0);
    try {
      console.log("Creating ZIP instance...");
      const zip = new JSZip();
      let fileCount = 0;
      const totalFiles = Object.keys(srcFiles).length + Object.keys(clientFiles).length + 
                        Object.keys(sharedFiles).length + Object.keys(supabaseFiles).length + 
                        Object.keys(publicFiles).length + Object.keys(configFiles).length;

      const addMap = (m: Record<string, string>, stepName: string) => {
        console.log(`${stepName} - Files: ${Object.keys(m).length}`);
        setCurrentStep(stepName);
        Object.entries(m).forEach(([path, content]) => {
          const normalized = path.startsWith("/") ? path.slice(1) : path;
          console.log(`Adding file: ${normalized}`);
          zip.file(normalized, content);
          fileCount++;
          setProgress(Math.round((fileCount / totalFiles) * 80)); // Reserve 20% for final steps
        });
      };

      // Add all file categories
      addMap(srcFiles, "Adding source files...");
      addMap(clientFiles, "Adding client files...");
      addMap(sharedFiles, "Adding shared files...");
      addMap(supabaseFiles, "Adding Supabase config...");
      addMap(publicFiles, "Adding public assets...");
      addMap(configFiles, "Adding config files...");

      setCurrentStep("Generating ZIP file...");
      setProgress(90);
      console.log("Generating ZIP blob...");
      
      const blob = await zip.generateAsync({ type: "blob" });
      console.log("ZIP blob generated, size:", blob.size);
      
      setCurrentStep("Starting download...");
      setProgress(100);
      
      console.log("Creating download link...");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "content-radar-project.zip";
      document.body.appendChild(a);
      console.log("Triggering download...");
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      console.log("Download triggered successfully");

      setCurrentStep("Complete!");
    } catch (e) {
      console.error("[ZIP Error] Failed to generate ZIP", e);
      alert(`Failed to generate ZIP: ${e.message}`);
    } finally {
      setTimeout(() => {
        setBusy(false);
        setProgress(0);
        setCurrentStep("");
      }, 1000);
    }
  };

  const features = [
    { icon: Folder, title: "Complete Source Code", desc: "All React components, hooks, and utilities" },
    { icon: FileArchive, title: "Build Configuration", desc: "Vite, TypeScript, Tailwind, and ESLint configs" },
    { icon: CheckCircle, title: "Database Schema", desc: "Supabase configuration and shared types" },
    { icon: Download, title: "Ready to Deploy", desc: "Everything needed to run the project locally" }
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <FileArchive className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-large-title font-bold mb-4">Download Project</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get the complete Content Radar project as a downloadable ZIP file. 
              Includes all source code, configurations, and documentation.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-apple-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Download Section */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Ready to Download</CardTitle>
              <CardDescription>
                This will package the entire project into a single ZIP file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {busy && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{currentStep}</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
              
              <div className="flex justify-center">
                <Button 
                  onClick={buildZip} 
                  disabled={busy}
                  size="lg"
                  className="px-8 group hover:shadow-apple-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <Download className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                  {busy ? "Preparing Download..." : "Download Project ZIP"}
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>The ZIP file will include:</p>
                <p className="mt-1">Source code • Configuration files • Database schema • Documentation</p>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="mt-8 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-lg">After Download</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">1</span>
                </div>
                <div>
                  <strong>Extract the ZIP file</strong> to your desired location
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">2</span>
                </div>
                <div>
                  <strong>Install dependencies</strong> with <code className="bg-muted px-1.5 py-0.5 rounded">npm install</code>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">3</span>
                </div>
                <div>
                  <strong>Start development</strong> with <code className="bg-muted px-1.5 py-0.5 rounded">npm run dev</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default DownloadZip;
