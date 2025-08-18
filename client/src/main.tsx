import React from 'react'
import { createRoot } from 'react-dom/client'

function SimpleApp() {
  return (
    <div style={{
      backgroundColor: 'white',
      color: 'black', 
      padding: '40px',
      minHeight: '100vh',
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: 'red', fontSize: '32px', marginBottom: '20px' }}>
        ✅ REACT IS WORKING!
      </h1>
      <p style={{ marginBottom: '15px' }}>
        This is a minimal React app without any dependencies.
      </p>
      <div style={{ 
        border: '3px solid blue', 
        padding: '15px', 
        margin: '20px 0',
        backgroundColor: '#f0f0f0'
      }}>
        <strong>Authentication Status:</strong> Bypassed for testing
      </div>
      <button 
        style={{ 
          backgroundColor: 'green', 
          color: 'white', 
          padding: '15px 30px', 
          border: 'none',
          fontSize: '16px',
          cursor: 'pointer',
          borderRadius: '5px'
        }}
        onClick={() => alert('Button works! React is functioning correctly.')}
      >
        Click to Test React
      </button>
      <hr style={{ margin: '30px 0' }} />
      <p style={{ fontSize: '14px', color: '#666' }}>
        Next step: Gradually add back UI components to identify the issue
      </p>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SimpleApp />
  </React.StrictMode>
)
