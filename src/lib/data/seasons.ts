import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { seedSeasons } from "./seed/seasons";
import type { Season } from "@/lib/types";

export async function getSeasons(): Promise<Season[]> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    if (supabase) {
      const { data, error } = await supabase.from("seasons").select("*");
      if (!error && data && data.length > 0) return data as unknown as Season[];
    }
  }
  return seedSeasons;
}
