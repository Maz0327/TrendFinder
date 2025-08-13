import { useQuery } from "@tanstack/react-query";
import type { CulturalMoment } from "@shared/supabase-schema";
import { listMoments } from "../services/moments";

export function useMoments(filters: Parameters<typeof listMoments>[0]) {
  const momentsQuery = useQuery<CulturalMoment[]>({
    queryKey: ["cr-moments", filters],
    queryFn: () => listMoments(filters),
    staleTime: 30_000,
  });
  return { momentsQuery };
}
