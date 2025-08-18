import { Providers } from './providers';

// Minimal test without any page component imports
function MinimalTest() {
  return (
    <div style={{
      backgroundColor: 'rgb(24, 28, 32)',
      color: 'rgb(241, 244, 248)',
      padding: '20px',
      minHeight: '100vh'
    }}>
      <h1 style={{ marginBottom: '16px' }}>Content Radar - Import Isolation Test</h1>
      <p>✅ Providers working</p>
      <p>✅ No page component imports</p>
      <p>✅ Testing if imports cause black screen</p>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        padding: '16px',
        marginTop: '16px'
      }}>
        <p style={{ margin: 0 }}>If this shows, the issue is with page component imports</p>
      </div>
    </div>
  );
}

export function UiV2App() {
  return (
    <Providers>
      <div className="ui-v2 bg-app min-h-screen text-ink">
        <MinimalTest />
      </div>
    </Providers>
  );
}