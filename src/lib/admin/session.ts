import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export interface AdminSession {
  authenticated: boolean;
  demoMode: boolean;
  email?: string;
  role?: string;
}

/**
 * Resolves the current admin session. When Supabase isn't configured yet,
 * the admin panel runs in demo mode (open access, clearly labeled) so the
 * whole module can be reviewed before wiring up real authentication.
 */
export async function getAdminSession(): Promise<AdminSession> {
  if (!isSupabaseConfigured()) {
    return { authenticated: true, demoMode: true };
  }
  const supabase = await createClient();
  if (!supabase) return { authenticated: true, demoMode: true };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { authenticated: false, demoMode: false };

  const { data: profile } = await supabase.from("users").select("role_id, roles(key)").eq("id", user.id).maybeSingle();
  const role = (profile as unknown as { roles?: { key?: string } } | null)?.roles?.key;

  return { authenticated: true, demoMode: false, email: user.email ?? undefined, role };
}
