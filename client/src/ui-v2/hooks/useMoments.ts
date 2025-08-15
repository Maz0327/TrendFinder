import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { momentsService, MomentsListParams } from '../services/moments';
import { Moment } from '../types';

export function useMoments(params: MomentsListParams) {
  const queryClient = useQueryClient();

  const { data: moments = [], isLoading, error } = useQuery({
    queryKey: ['moments', params],
    queryFn: () => momentsService.list(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Moment>) =>
      momentsService.update(id, data),
    onSuccess: (updatedMoment) => {
      queryClient.setQueriesData(
        { queryKey: ['moments'] },
        (old: Moment[] = []) =>
          old.map((m) => (m.id === updatedMoment.id ? updatedMoment : m))
      );
    },
  });

  return {
    moments,
    isLoading,
    error,
    updateMoment: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}

export function useMoment(id: string) {
  return useQuery({
    queryKey: ['moments', id],
    queryFn: () => momentsService.get(id),
    enabled: !!id,
  });
}