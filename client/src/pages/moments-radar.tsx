// client/src/pages/moments-radar.tsx
import React from 'react';

export default function MomentsRadar() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">Moments Radar</h1>
      <div className="space-y-4">
        <div className="p-4 rounded-lg border border-zinc-700 bg-zinc-900">
          <h3 className="font-semibold mb-2">Cultural Moments</h3>
          <p className="text-sm text-zinc-400">Real-time cultural moment detection will be displayed here.</p>
        </div>
      </div>
    </div>
  );
}