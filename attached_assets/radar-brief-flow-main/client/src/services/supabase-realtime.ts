import { getClient } from "./supabase";

export function subscribeRealtime(onToast: (msg: string) => void) {
  const supabase = getClient();
  const channel = supabase
    .channel("content-radar-realtime")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "captures" }, () => onToast("New capture added"))
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "cultural_moments" }, () => onToast("Moment updated"))
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "dsd_briefs" }, () => onToast("New brief created"))
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "projects" }, () => onToast("New project added"))
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "user_feeds" }, () => onToast("New feed added"))
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
