import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Simplified version for now since we don't have the full services setup
export function useProjects() {
  const qc = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      // Mock data for now
      return [
        { id: "1", name: "Demo Project", created_at: new Date().toISOString() }
      ];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Mock creation
      return { id: "new", name: data.name, created_at: new Date().toISOString() };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  return { projectsQuery, createMutation };
}