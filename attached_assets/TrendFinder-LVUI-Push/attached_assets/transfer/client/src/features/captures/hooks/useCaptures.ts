// Capture hooks - Phase 2 migration
// Replaces old signal-based hooks

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { CaptureStatus } from '../types';
import type { Signal as Capture, InsertSignal as InsertCapture } from '@shared/schema';

// Get captures for a project
export function useProjectCaptures(projectId: string, status?: CaptureStatus) {
  return useQuery({
    queryKey: ['captures', projectId, status],
    queryFn: () => apiClient.captures.getByProject(projectId, status),
    enabled: !!projectId,
  });
}

// Create a new capture
export function useCreateCapture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InsertCapture) => apiClient.captures.create(data),
    onSuccess: (capture) => {
      // Invalidate captures list
      queryClient.invalidateQueries({ queryKey: ['captures'] });
      // Update workspace stats
      queryClient.invalidateQueries({ queryKey: ['workspace', 'stats'] });
    },
  });
}

// Promote capture status
export function usePromoteCapture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newStatus, reason }: { 
      id: string; 
      newStatus: CaptureStatus; 
      reason?: string 
    }) => apiClient.captures.promote(id, newStatus, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['captures'] });
      queryClient.invalidateQueries({ queryKey: ['workspace', 'stats'] });
    },
  });
}

// Update capture
export function useUpdateCapture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertCapture> }) => 
      apiClient.captures.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['captures'] });
    },
  });
}

// Delete capture
export function useDeleteCapture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.captures.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['captures'] });
      queryClient.invalidateQueries({ queryKey: ['workspace', 'stats'] });
    },
  });
}