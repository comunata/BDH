import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { seedPromotions, seedVouchers } from "./seed/promotions";
import type { Promotion, GiftVoucher } from "@/lib/types";

export async function getPromotionByCode(code: string): Promise<Promotion | undefined> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return undefined;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    if (supabase) {
      const { data, error } = await supabase.from("promotions").select("*").eq("code", normalized).eq("active", true).maybeSingle();
      if (!error && data) return data as unknown as Promotion;
    }
  }
  const now = new Date();
  return seedPromotions.find(
    (p) => p.code === normalized && p.active && new Date(p.validFrom) <= now && new Date(p.validTo) >= now
  );
}

export async function getAllPromotions(): Promise<Promotion[]> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    if (supabase) {
      const { data, error } = await supabase.from("promotions").select("*");
      if (!error && data && data.length > 0) return data as unknown as Promotion[];
    }
  }
  return seedPromotions;
}

export async function getAllVouchers(): Promise<GiftVoucher[]> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    if (supabase) {
      const { data, error } = await supabase.from("vouchers").select("*");
      if (!error && data && data.length > 0) return data as unknown as GiftVoucher[];
    }
  }
  return seedVouchers;
}

export async function getVoucherByCode(code: string): Promise<GiftVoucher | undefined> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return undefined;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    if (supabase) {
      const { data, error } = await supabase.from("vouchers").select("*").eq("code", normalized).eq("active", true).maybeSingle();
      if (!error && data) return data as unknown as GiftVoucher;
    }
  }
  return seedVouchers.find((v) => v.code === normalized && v.active && new Date(v.expiresAt) >= new Date());
}
