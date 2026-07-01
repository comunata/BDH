import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { seedAttractions, seedEvents } from "./seed/explore";
import type { Attraction, LocalEvent } from "@/lib/types";

export async function getAttractions(): Promise<Attraction[]> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    if (supabase) {
      const { data, error } = await supabase.from("attractions").select("*");
      if (!error && data && data.length > 0) return data as unknown as Attraction[];
    }
  }
  return seedAttractions;
}

export async function getLocalEvents(): Promise<LocalEvent[]> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    if (supabase) {
      const { data, error } = await supabase.from("events").select("*").order("date", { ascending: true });
      if (!error && data && data.length > 0) return data as unknown as LocalEvent[];
    }
  }
  return seedEvents;
}
