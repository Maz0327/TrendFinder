import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listMoments, createMoment } from "@/services/moments";
import type { Database } from "@shared/database.types";

type Moment = Database["public"]["Tables"]["cultural_moments"]["Row"];
type MomentInsert = Database["public"]["Tables"]["cultural_moments"]["Insert"];

export function useMoments(params?: { projectId?: string }) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["/api/moments", params?.projectId],
    queryFn: () => listMoments(params),
  });

  const insertMutation = useMutation({
    mutationFn: (payload: MomentInsert) => createMoment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/moments"] });
    },
  });

  const insertDummy = () => {
    return insertMutation.mutateAsync({
      title: "Test Cultural Moment",
      description: "A tiny smoke-test moment",
      intensity: 3,
      platforms: ["tiktok", "instagram"],
      demographics: ["Gen Z", "Millennials"],
      duration: "fleeting",
    });
  };

  return { 
    data: query.data || null, 
    loading: query.isLoading, 
    error: query.error?.message || null, 
    fetchMoments: query.refetch,
    insertDummy,
    insertMutation
  };
}