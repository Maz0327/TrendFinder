import { ReactNode, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const qc = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

// Test ThemeProvider only - the most critical provider for styling
function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const el = document.documentElement;
    const body = document.body;
    const saved = localStorage.getItem("theme");
    const theme = saved || "dark";
    
    el.classList.remove("theme-dark", "theme-light");
    el.classList.add(theme === "light" ? "theme-light" : "theme-dark");
    
    // Ensure body has proper styling
    body.classList.add("bg-app", "text-ink");
    body.style.minHeight = "100vh";
    body.style.margin = "0";
    body.style.padding = "0";
  }, []);
  return <>{children}</>;
}

// Test with QueryClient + ThemeProvider
function QueryClientTest() {
  return (
    <div style={{
      backgroundColor: 'rgb(24, 28, 32)',
      color: 'rgb(241, 244, 248)',
      padding: '20px',
      minHeight: '100vh'
    }}>
      <h1 style={{ marginBottom: '16px' }}>Content Radar - QueryClient Test</h1>
      <p>✅ React working</p>
      <p>✅ CSS working</p>
      <p>✅ ThemeProvider working</p>
      <p>✅ QueryClientProvider added</p>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        padding: '16px',
        marginTop: '16px'
      }}>
        <p style={{ margin: 0 }}>Testing if QueryClient causes issues</p>
      </div>
    </div>
  );
}

export function UiV2App() {
  return (
    <QueryClientProvider client={qc}>
      <ThemeProvider>
        <div className="ui-v2 bg-app min-h-screen text-ink">
          <QueryClientTest />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}