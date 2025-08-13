import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listBriefs, createBrief } from "@/services/briefs";
import type { Database } from "@shared/database.types";

type Brief = Database["public"]["Tables"]["dsd_briefs"]["Row"];
type BriefInsert = Database["public"]["Tables"]["dsd_briefs"]["Insert"];

export function useBriefs(params?: { projectId?: string }) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["/api/briefs", params?.projectId],
    queryFn: () => listBriefs(params),
  });

  const insertMutation = useMutation({
    mutationFn: (payload: Omit<BriefInsert, "user_id">) => {
      const briefPayload: BriefInsert = {
        ...payload,
        title: payload.title || "Test DSD Brief",
        status: payload.status || "draft",
        define_section: payload.define_section || { bullets: ["who, what, why"] },
        shift_section: payload.shift_section || { directions: ["reframe X as Y"] },
        deliver_section: payload.deliver_section || { outputs: ["IG reels concept", "post copy"] },
      };
      return createBrief(briefPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/briefs"] });
    },
  });

  const insertDummy = () => {
    return insertMutation.mutateAsync({
      title: "Test DSD Brief",
      status: "draft",
      define_section: { bullets: ["who, what, why"] },
      shift_section: { directions: ["reframe X as Y"] },
      deliver_section: { outputs: ["IG reels concept", "post copy"] },
    } as Omit<BriefInsert, "user_id">);
  };

  return { 
    data: query.data || null, 
    loading: query.isLoading, 
    error: query.error?.message || null, 
    fetchBriefs: query.refetch,
    insertDummy,
    insertMutation
  };
}