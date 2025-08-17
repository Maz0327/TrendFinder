import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listBriefs, createBrief, updateBrief, deleteBrief } from '../../services/briefs';
import { Brief } from '../types';

type BriefsListParams = { projectId?: string; q?: string; tags?: string[]; page?: number; pageSize?: number };

export function useBriefs(params: BriefsListParams) {
  const queryClient = useQueryClient();

  const { data: briefs = [], isLoading, error } = useQuery({
    queryKey: ['briefs', params],
    queryFn: () => listBriefs(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const createMutation = useMutation({
    mutationFn: createBrief,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Brief>) =>
      updateBrief(id, data),
    onSuccess: (updatedBrief) => {
      queryClient.setQueriesData(
        { queryKey: ['briefs'] },
        (old: Brief[] = []) =>
          old.map((b) => (b.id === updatedBrief.id ? updatedBrief : b))
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBrief(id),
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