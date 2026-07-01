import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { seedServices } from "./seed/services";
import type { ExtraService } from "@/lib/types";

export async function getServices(): Promise<ExtraService[]> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    if (supabase) {
      const { data, error } = await supabase.from("services").select("*").eq("active", true);
      if (!error && data && data.length > 0) return data as unknown as ExtraService[];
    }
  }
  return seedServices.filter((s) => s.active);
}

export async function getServicesByIds(ids: string[]): Promise<ExtraService[]> {
  const services = await getServices();
  return services.filter((s) => ids.includes(s.id));
}
