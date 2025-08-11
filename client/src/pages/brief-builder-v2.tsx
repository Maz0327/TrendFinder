import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Database } from '@shared/database.types';
import { FLAGS } from '@/flags';
import { apiRequest } from '@/lib/queryClient';
import { useState } from 'react';

type DSDBrief = Database['public']['Tables']['dsd_briefs']['Row'];
type Capture = Database['public']['Tables']['captures']['Row'];

export default function BriefBuilderV2() {
  if (!FLAGS.PHASE5_BRIEF_V2) {
    return null;
  }

  const [selectedBriefId, setSelectedBriefId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: briefs, isLoading: briefsLoading } = useQuery<DSDBrief[]>({
    queryKey: ['/api/dsd-briefs'],
  });

  const { data: captures, isLoading: capturesLoading } = useQuery<Capture[]>({
    queryKey: ['/api/captures'],
  });

  const selectedBrief = briefs?.find(b => b.id === selectedBriefId);
  const linkedCaptures = captures?.slice(0, 3) || []; // Show first 3 captures as sample

  const updateBrief = useMutation({
    mutationFn: async (updates: Partial<DSDBrief>) => {
      if (!selectedBriefId) throw new Error('No brief selected');
      return await apiRequest(`/api/dsd-briefs/${selectedBriefId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dsd-briefs'] });
    }
  });

  if (briefsLoading || capturesLoading) {
    return (
      <div className="p-6" data-testid="brief-builder-loading">
        <h1 className="text-2xl font-bold mb-4">DSD Brief Builder v2</h1>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="brief-builder-v2">
      <h1 className="text-2xl font-bold mb-4">DSD Brief Builder v2</h1>
      
      {/* Brief Selection */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Select Brief</h2>
        <div className="grid gap-2">
          {briefs?.map((brief) => (
            <button
              key={brief.id}
              onClick={() => setSelectedBriefId(brief.id)}
              className={`p-3 text-left border rounded-lg ${
                selectedBriefId === brief.id 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              data-testid={`brief-select-${brief.id}`}
            >
              <div className="font-medium">{brief.title}</div>
              <div className="text-sm text-gray-500">Status: {brief.status}</div>
            </button>
          ))}
          {(!briefs || briefs.length === 0) && (
            <div className="text-center py-4 text-gray-500" data-testid="briefs-empty">
              No briefs found
            </div>
          )}
        </div>
      </div>

      {/* Brief Editor */}
      {selectedBrief && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={selectedBrief.title}
              onChange={(e) => updateBrief.mutate({ title: e.target.value })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded"
              data-testid="brief-title-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Define Section</label>
            <textarea
              value={typeof selectedBrief.define_section === 'string' ? selectedBrief.define_section : JSON.stringify(selectedBrief.define_section)}
              onChange={(e) => updateBrief.mutate({ define_section: e.target.value })}
              rows={3}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded"
              data-testid="brief-define-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Shift Section</label>
            <textarea
              value={typeof selectedBrief.shift_section === 'string' ? selectedBrief.shift_section : JSON.stringify(selectedBrief.shift_section)}
              onChange={(e) => updateBrief.mutate({ shift_section: e.target.value })}
              rows={3}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded"
              data-testid="brief-shift-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Deliver Section</label>
            <textarea
              value={typeof selectedBrief.deliver_section === 'string' ? selectedBrief.deliver_section : JSON.stringify(selectedBrief.deliver_section)}
              onChange={(e) => updateBrief.mutate({ deliver_section: e.target.value })}
              rows={3}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded"
              data-testid="brief-deliver-input"
            />
          </div>

          {/* Linked Captures */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Linked Captures</h3>
            <div className="space-y-2">
              {linkedCaptures.map((capture) => (
                <div 
                  key={capture.id}
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800"
                  data-testid={`linked-capture-${capture.id}`}
                >
                  <div className="font-medium">{capture.title}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{capture.content}</div>
                  <div className="text-xs text-gray-500 mt-1">Platform: {capture.platform}</div>
                </div>
              ))}
              {linkedCaptures.length === 0 && (
                <div className="text-center py-4 text-gray-500" data-testid="captures-empty">
                  No captures linked to this brief
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}