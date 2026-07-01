import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { seedRooms } from "./seed/rooms";
import type { Room } from "@/lib/types";

/**
 * Data-access layer: reads from Supabase when configured, otherwise serves
 * the bundled seed data so the whole site keeps working out of the box.
 * This is the pattern every lib/data/* module in this project follows.
 */
export async function getRooms(): Promise<Room[]> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    if (supabase) {
      const { data, error } = await supabase.from("rooms").select("*").eq("active", true);
      if (!error && data && data.length > 0) return data as unknown as Room[];
    }
  }
  return seedRooms.filter((r) => r.active);
}

export async function getRoomBySlug(slug: string): Promise<Room | undefined> {
  const rooms = await getRooms();
  return rooms.find((r) => r.slug === slug);
}
