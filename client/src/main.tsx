import React from 'react'
import { createRoot } from 'react-dom/client'
import "./index.css";
import "./ui-v2/index.css";
import SimpleBriefsPage from './ui-v2/pages/SimpleBriefsPage'

import { useState } from 'react';
import { Home, FileText, TrendingUp, Search, Settings, User } from 'lucide-react';

function Navigation({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'briefs', label: 'Strategic Briefs', icon: FileText },
    { id: 'moments', label: 'Moments Radar', icon: TrendingUp },
    { id: 'search', label: 'Explore', icon: Search },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="w-full" style={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.3)' }}></div>
            <span className="text-xl font-bold text-white">Content Radar</span>
          </div>
          
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === item.id 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:block">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <User className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function WorkingApp() {
  const [activeTab, setActiveTab] = useState('briefs');

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#ffffff'
    }}>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'briefs' && <SimpleBriefsPage />}
        {activeTab === 'dashboard' && (
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-white mb-4">Dashboard</h1>
            <p className="text-white/70">Coming soon - Your strategic intelligence overview</p>
          </div>
        )}
        {activeTab === 'moments' && (
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-white mb-4">Moments Radar</h1>
            <p className="text-white/70">Coming soon - Real-time cultural moment detection</p>
          </div>
        )}
        {activeTab === 'search' && (
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-white mb-4">Explore Signals</h1>
            <p className="text-white/70">Coming soon - Content signal exploration</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-white mb-4">Settings</h1>
            <p className="text-white/70">Coming soon - Platform configuration</p>
          </div>
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WorkingApp />
  </React.StrictMode>
)
