import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '../services/projects';
import { Project } from '../types/dto';

export function useProjects() {
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsService.list,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const createMutation = useMutation({
    mutationFn: projectsService.create,
    onSuccess: (newProject) => {
      queryClient.setQueryData(['projects'], (old: Project[] = []) => [newProject, ...old]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Project>) =>
      projectsService.update(id, data),
    onSuccess: (updatedProject) => {
      queryClient.setQueryData(['projects'], (old: Project[] = []) =>
        old.map((p) => (p.id === updatedProject.id ? updatedProject : p))
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: projectsService.delete,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['projects'], (old: Project[] = []) =>
        old.filter((p) => p.id !== deletedId)
      );
    },
  });

  return {
    projects,
    isLoading,
    error,
    createProject: createMutation.mutateAsync,
    updateProject: updateMutation.mutateAsync,
    deleteProject: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}