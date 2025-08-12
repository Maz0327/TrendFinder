import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { BriefRow } from "@shared/database.types";
import { createBrief, getBrief, listBriefs, updateBriefSections } from "../services/briefs";

export function useBriefs(projectId?: string) {
  const qc = useQueryClient();

  const briefsQuery = useQuery<BriefRow[]>({
    queryKey: ["cr-briefs", projectId ?? null],
    queryFn: () => listBriefs(projectId),
  });

  const createMutation = useMutation({
    mutationFn: createBrief,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cr-briefs"] }),
  });

  const updateSections = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: { define_section?: any; shift_section?: any; deliver_section?: any } }) =>
      updateBriefSections(id, patch),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["cr-briefs"] });
      qc.setQueryData(["cr-brief", data.id], data);
    },
  });

  const briefQuery = (id: string) =>
    useQuery<BriefRow>({
      queryKey: ["cr-brief", id],
      queryFn: () => getBrief(id),
      enabled: !!id,
    });

  return { briefsQuery, createMutation, updateSections, briefQuery };
}
