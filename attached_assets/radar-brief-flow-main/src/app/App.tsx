import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppLayout from "@/layout/AppLayout";

const queryClient = new QueryClient();

const AppV2 = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout>
        <section className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-semibold mb-2">Welcome to Content Radar V2</h1>
          <p className="text-muted-foreground mb-4">
            Use the navigation to access Captures, Moments, Feeds, and Brief Builder. This shell is wired to the
            new services/hooks with a Project Switcher.
          </p>
        </section>
      </AppLayout>
    </QueryClientProvider>
  );
};

export default AppV2;
