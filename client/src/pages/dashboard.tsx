// client/src/pages/dashboard.tsx
import React from 'react';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-zinc-700 bg-zinc-900">
          <h3 className="font-semibold mb-2">Total Captures</h3>
          <p className="text-2xl font-bold text-zinc-100">128</p>
        </div>
        <div className="p-4 rounded-lg border border-zinc-700 bg-zinc-900">
          <h3 className="font-semibold mb-2">Active Moments</h3>
          <p className="text-2xl font-bold text-zinc-100">12</p>
        </div>
        <div className="p-4 rounded-lg border border-zinc-700 bg-zinc-900">
          <h3 className="font-semibold mb-2">Briefs Created</h3>
          <p className="text-2xl font-bold text-zinc-100">34</p>
        </div>
      </div>
    </div>
  );
}