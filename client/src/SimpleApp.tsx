// Minimal app to test if React is working
function SimpleApp() {
  // Add console log to see if React is executing
  console.log('SimpleApp is rendering!');
  
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: 'red', // Make it very visible
      minHeight: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999
    }}>
      <h1 style={{ color: 'white', fontSize: '48px' }}>REACT IS WORKING!</h1>
      <p style={{ color: 'white', fontSize: '24px' }}>If you see this red background, React mounted successfully</p>
      <p style={{ color: 'white' }}>Current time: {new Date().toLocaleString()}</p>
      <button 
        style={{ padding: '10px 20px', fontSize: '18px' }}
        onClick={() => alert('Button clicked!')}
      >
        Test Button
      </button>
    </div>
  );
}

export default SimpleApp;