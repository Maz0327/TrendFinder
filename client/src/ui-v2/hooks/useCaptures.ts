import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { capturesService, CapturesListParams } from '../services/captures';
import { Capture } from '../types';

export function useCaptures(params: CapturesListParams) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['captures', params],
    queryFn: () => capturesService.list(params),
    staleTime: 30 * 1000, // 30 seconds
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Capture>) =>
      capturesService.update(id, data),
    onSuccess: (updatedCapture) => {
      // Update the capture in all relevant queries
      queryClient.setQueriesData(
        { queryKey: ['captures'] },
        (old: any) => {
          if (!old?.items) return old;
          return {
            ...old,
            items: old.items.map((c: Capture) =>
              c.id === updatedCapture.id ? updatedCapture : c
            ),
          };
        }
      );
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Capture['status'] }) =>
      capturesService.updateStatus(id, status),
    onSuccess: (updatedCapture) => {
      queryClient.setQueriesData(
        { queryKey: ['captures'] },
        (old: any) => {
          if (!old?.items) return old;
          return {
            ...old,
            items: old.items.map((c: Capture) =>
              c.id === updatedCapture.id ? updatedCapture : c
            ),
          };
        }
      );
    },
  });

  return {
    captures: data?.items || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 20,
    isLoading,
    error,
    updateCapture: updateMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdating: updateMutation.isPending || updateStatusMutation.isPending,
  };
}

export function useCapture(id: string) {
  return useQuery({
    queryKey: ['captures', id],
    queryFn: () => capturesService.get(id),
    enabled: !!id,
  });
}