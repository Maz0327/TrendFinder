import React from 'react'
import { createRoot } from 'react-dom/client'
import "./index.css";
import "./ui-v2/index.css";
import SimpleBriefsPage from './ui-v2/pages/SimpleBriefsPage'

function WorkingApp() {
  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#ffffff'
    }}>
      <div className="container mx-auto px-4 py-8">
        <SimpleBriefsPage />
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WorkingApp />
  </React.StrictMode>
)
