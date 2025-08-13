import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Capture } from "@shared/supabase-schema";
import { listCaptures, updateCapture } from "../services/captures";

export function useCaptures(filters: Parameters<typeof listCaptures>[0]) {
  const qc = useQueryClient();

  const capturesQuery = useQuery<Capture[]>({
    queryKey: ["cr-captures", filters],
    queryFn: () => listCaptures(filters),
    staleTime: 30_000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Capture> }) => updateCapture(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cr-captures"] });
    },
  });

  return { capturesQuery, updateMutation };
}
