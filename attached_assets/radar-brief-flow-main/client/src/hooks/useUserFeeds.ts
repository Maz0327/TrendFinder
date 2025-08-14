import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserFeedRow } from "@shared/database.types";
import { createUserFeed, deleteUserFeed, listUserFeeds, toggleUserFeedActive } from "../services/feeds";

export function useUserFeeds(projectId?: string) {
  const qc = useQueryClient();

  const feedsQuery = useQuery<UserFeedRow[]>({
    queryKey: ["user_feeds", projectId ?? null],
    queryFn: () => listUserFeeds(projectId),
  });

  const createMutation = useMutation({
    mutationFn: createUserFeed,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user_feeds"] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => toggleUserFeedActive(id, active),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user_feeds"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUserFeed,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user_feeds"] }),
  });

  return { feedsQuery, createMutation, toggleMutation, deleteMutation };
}
