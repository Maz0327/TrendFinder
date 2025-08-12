import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createUserFeed, deleteUserFeed, listUserFeeds, toggleUserFeedActive } from "@/services/feeds";

export function useUserFeeds(projectId?: string | null) {
  const qc = useQueryClient();

  const feeds = useQuery({
    queryKey: ["user_feeds", { projectId: projectId ?? null }],
    queryFn: () => listUserFeeds(projectId ?? null),
  });

  const addFeed = useMutation({
    mutationFn: createUserFeed,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user_feeds"] }),
  });

  const setActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleUserFeedActive(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user_feeds"] }),
  });

  const removeFeed = useMutation({
    mutationFn: (id: string) => deleteUserFeed(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user_feeds"] }),
  });

  return { feeds, addFeed, setActive, removeFeed };
}