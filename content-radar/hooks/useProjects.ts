import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Project } from "@shared/supabase-schema";
import { listProjects, createProject } from "../services/projects";

export function useProjects() {
  const qc = useQueryClient();

  const projectsQuery = useQuery<Project[]>({
    queryKey: ["cr-projects"],
    queryFn: () => listProjects(),
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cr-projects"] }),
  });

  return { projectsQuery, createMutation };
}
