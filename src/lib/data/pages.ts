import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { seedPages, type PageContent } from "./seed/pages";

export async function getPage(slug: string): Promise<PageContent | undefined> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    if (supabase) {
      const { data, error } = await supabase.from("pages").select("*").eq("slug", slug).maybeSingle();
      if (!error && data) return data as unknown as PageContent;
    }
  }
  return seedPages[slug];
}
