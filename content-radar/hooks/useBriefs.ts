import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { DsdBrief } from "@shared/supabase-schema";
import { createBrief, getBrief, listBriefs, updateBriefSections } from "../services/briefs";

export function useBriefs(projectId?: string) {
  const qc = useQueryClient();

  const briefsQuery = useQuery<DsdBrief[]>({
    queryKey: ["cr-briefs", projectId ?? null],
    queryFn: () => listBriefs(projectId),
  });

  const createMutation = useMutation({
    mutationFn: createBrief,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cr-briefs"] }),
  });

  const updateSections = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: { defineContent?: any; shiftContent?: any; deliverContent?: any } }) =>
      updateBriefSections(id, patch),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["cr-briefs"] });
      qc.setQueryData(["cr-brief", data.id], data);
    },
  });

  const briefQuery = (id: string) =>
    useQuery<DsdBrief>({
      queryKey: ["cr-brief", id],
      queryFn: () => getBrief(id),
      enabled: !!id,
    });

  return { briefsQuery, createMutation, updateSections, briefQuery };
}
