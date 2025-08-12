import { supabase } from "../../../client/src/lib/supabaseClient";
import { useLocation } from "wouter";

export default function LogoutButton() {
  const [, navigate] = useLocation();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/app-v2/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-muted hover:text-foreground transition-colors"
    >
      Sign out
    </button>
  );
}