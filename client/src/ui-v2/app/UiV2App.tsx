// Test with minimal providers - no QueryClient or complex providers
function MinimalProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Test with basic content only
function BasicContentTest() {
  return (
    <div style={{
      backgroundColor: 'rgb(24, 28, 32)',
      color: 'rgb(241, 244, 248)',
      padding: '20px',
      minHeight: '100vh'
    }}>
      <h1 style={{ marginBottom: '16px' }}>Content Radar - Minimal Providers Test</h1>
      <p>✅ React working</p>
      <p>✅ CSS working</p>
      <p>✅ No complex providers</p>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        padding: '16px',
        marginTop: '16px'
      }}>
        <p style={{ margin: 0 }}>Testing if Providers component causes the failure</p>
      </div>
    </div>
  );
}

export function UiV2App() {
  return (
    <MinimalProviders>
      <div className="ui-v2 bg-app min-h-screen text-ink">
        <BasicContentTest />
      </div>
    </MinimalProviders>
  );
}