import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { briefsService, BriefsListParams } from '../services/briefs';
import { Brief } from '../types';

export function useBriefs(params: BriefsListParams) {
  const queryClient = useQueryClient();

  const { data: briefs = [], isLoading, error } = useQuery({
    queryKey: ['briefs', params],
    queryFn: () => briefsService.list(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const createMutation = useMutation({
    mutationFn: briefsService.create,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Brief>) =>
      briefsService.update(id, data),
    onSuccess: (updatedBrief) => {
      queryClient.setQueriesData(
        { queryKey: ['briefs'] },
        (old: Brief[] = []) =>
          old.map((b) => (b.id === updatedBrief.id ? updatedBrief : b))
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: briefsService.delete,
    onSuccess: (_, deletedId) => {
      queryClient.setQueriesData(
        { queryKey: ['briefs'] },
        (old: Brief[] = []) => old.filter((b) => b.id !== deletedId)
      );
    },
  });

  return {
    briefs,
    isLoading,
    error,
    createBrief: createMutation.mutateAsync,
    updateBrief: updateMutation.mutateAsync,
    deleteBrief: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}