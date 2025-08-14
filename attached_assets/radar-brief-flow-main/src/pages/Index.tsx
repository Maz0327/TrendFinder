import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  useEffect(() => {
    document.title = "Content Radar — Strategist UI";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Content Radar: Captures Inbox, Moments Radar, and Brief Builder for strategists.');
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-16 bg-background px-6">
      <section className="text-center max-w-4xl animate-fade-in">
        <h1 className="text-large-title mb-4 text-foreground">
          Content Radar
        </h1>
        <p className="text-xl text-muted-foreground mb-3 font-medium">Strategist UI</p>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Dark, fast, and traceable. Triage captures, visualize cultural moments, and assemble briefs.
        </p>
      </section>
      
      <nav className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl animate-slide-up">
        <Button size="lg" asChild className="h-14 text-base font-semibold">
          <Link to="/captures-inbox">Captures Inbox</Link>
        </Button>
        <Button variant="secondary" size="lg" asChild className="h-14 text-base">
          <Link to="/moments-radar">Moments Radar</Link>
        </Button>
        <Button variant="secondary" size="lg" asChild className="h-14 text-base">
          <Link to="/brief-builder-v2">Brief Builder v2</Link>
        </Button>
        <Button variant="outline" size="lg" asChild className="h-14 text-base">
          <Link to="/search">Search</Link>
        </Button>
        <Button variant="outline" size="lg" asChild className="h-14 text-base">
          <Link to="/collections">Collections</Link>
        </Button>
        <Button variant="outline" size="lg" asChild className="h-14 text-base">
          <Link to="/download-zip">Download ZIP</Link>
        </Button>
      </nav>
    </main>
  );
};

export default Index;
