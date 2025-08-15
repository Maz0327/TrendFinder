import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feedsService } from '../services/feeds';
import { Feed } from '../types';

export function useFeeds() {
  const queryClient = useQueryClient();

  const { data: feeds = [], isLoading, error } = useQuery({
    queryKey: ['feeds'],
    queryFn: feedsService.list,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const createMutation = useMutation({
    mutationFn: feedsService.create,
    onSuccess: (newFeed) => {
      queryClient.setQueryData(['feeds'], (old: Feed[] = []) => [newFeed, ...old]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Feed>) =>
      feedsService.update(id, data),
    onSuccess: (updatedFeed) => {
      queryClient.setQueryData(['feeds'], (old: Feed[] = []) =>
        old.map((f) => (f.id === updatedFeed.id ? updatedFeed : f))
      );
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      feedsService.toggle(id, isActive),
    onSuccess: (updatedFeed) => {
      queryClient.setQueryData(['feeds'], (old: Feed[] = []) =>
        old.map((f) => (f.id === updatedFeed.id ? updatedFeed : f))
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: feedsService.delete,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['feeds'], (old: Feed[] = []) =>
        old.filter((f) => f.id !== deletedId)
      );
    },
  });

  return {
    feeds,
    isLoading,
    error,
    createFeed: createMutation.mutateAsync,
    updateFeed: updateMutation.mutateAsync,
    toggleFeed: toggleMutation.mutateAsync,
    deleteFeed: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isToggling: toggleMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}