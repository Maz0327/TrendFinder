// client/src/pages/settings.tsx
import React from 'react';

export default function Settings() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
      <div className="space-y-4">
        <div className="p-4 rounded-lg border border-zinc-700 bg-zinc-900">
          <h3 className="font-semibold mb-2">User Preferences</h3>
          <p className="text-sm text-zinc-400">Application settings and preferences will be displayed here.</p>
        </div>
      </div>
    </div>
  );
}