import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createProject, listProjects } from "@/services/feeds";

export function useProjects() {
  const qc = useQueryClient();

  const projects = useQuery({
    queryKey: ["projects"],
    queryFn: () => listProjects(),
  });

  const addProject = useMutation({
    mutationFn: createProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });

  return { projects, addProject };
}