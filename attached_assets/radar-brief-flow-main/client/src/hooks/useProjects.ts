import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProjectRow } from "@shared/database.types";
import { createProject, listProjects } from "../services/projects";

export function useProjects() {
  const qc = useQueryClient();

  const projectsQuery = useQuery<ProjectRow[]>({
    queryKey: ["projects"],
    queryFn: () => listProjects(),
  });

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  return { projectsQuery, createMutation };
}
