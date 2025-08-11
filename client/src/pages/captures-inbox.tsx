// client/src/pages/captures-inbox.tsx
import React from 'react';

export default function CapturesInbox() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">Captures Inbox</h1>
      <div className="space-y-4">
        <div className="p-4 rounded-lg border border-zinc-700 bg-zinc-900">
          <h3 className="font-semibold mb-2">Recent Capture</h3>
          <p className="text-sm text-zinc-400">Content analysis and tagging functionality will be displayed here.</p>
        </div>
      </div>
    </div>
  );
}