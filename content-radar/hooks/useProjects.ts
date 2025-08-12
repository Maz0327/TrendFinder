import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProjectRow } from "@shared/database.types";
import { listProjects, createProject } from "../services/projects";

export function useProjects() {
  const qc = useQueryClient();

  const projectsQuery = useQuery<ProjectRow[]>({
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
