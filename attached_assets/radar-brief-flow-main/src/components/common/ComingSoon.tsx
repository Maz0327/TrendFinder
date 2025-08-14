import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const ComingSoon = ({ title = "Coming soon", description = "This feature is gated by a feature flag. Check back later." }: { title?: string; description?: string }) => {
  return (
    <main className="min-h-screen grid place-items-center bg-background text-foreground">
      <section className="max-w-xl text-center p-8 rounded-2xl bg-card shadow-sm border">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 grid place-items-center mb-4">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-3xl font-semibold mb-2">{title}</h1>
        <p className="text-muted-foreground mb-6">{description}</p>
        <div className="flex items-center justify-center gap-3">
          <Button asChild>
            <Link to="/">Go home</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/captures-inbox">Try Captures Inbox</Link>
          </Button>
        </div>
      </section>
    </main>
  );
};

export default ComingSoon;
