// Simple test component to check if React is working
export default function TestApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>React Test App</h1>
      <p>If you can see this, React is working!</p>
      <p>Time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}