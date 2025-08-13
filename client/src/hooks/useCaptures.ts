import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listCaptures, createCapture } from "@/services/captures";
import type { Database } from "@shared/database.types";

type Capture = Database["public"]["Tables"]["captures"]["Row"];
type CaptureInsert = Database["public"]["Tables"]["captures"]["Insert"];

export function useCaptures(params?: {
  projectId?: string;
  status?: string;
  platform?: string;
  tag?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["/api/captures", params],
    queryFn: () => listCaptures(params),
  });

  const insertMutation = useMutation({
    mutationFn: (payload: Omit<CaptureInsert, "user_id">) => {
      const capturePayload: CaptureInsert = {
        ...payload,
        title: payload.title || "Test Capture",
        content: payload.content || "This is a smoke-test capture",
        platform: payload.platform || "web",
        tags: payload.tags || ["test", "smoke"],
        dsd_tags: payload.dsd_tags || ["define"],
        predicted_virality: payload.predicted_virality || 0.42,
        actual_virality: payload.actual_virality || 0,
      };
      return createCapture(capturePayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/captures"] });
    },
  });

  const insertDummy = () => {
    return insertMutation.mutateAsync({
      title: "Test Capture",
      content: "This is a smoke-test capture",
      platform: "web",
      tags: ["test", "smoke"],
      dsd_tags: ["define"],
      predicted_virality: 0.42,
      actual_virality: 0,
    } as Omit<CaptureInsert, "user_id">);
  };

  return { 
    data: query.data?.items || null, 
    total: query.data?.total || 0,
    loading: query.isLoading, 
    error: query.error?.message || null, 
    fetchCaptures: query.refetch,
    insertDummy,
    insertMutation
  };
}