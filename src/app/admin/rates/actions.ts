"use server";

import { revalidatePath } from "next/cache";
import { setRoomRateOverride } from "@/lib/data/seasons";

export async function setRateOverrideAction(formData: FormData): Promise<void> {
  const roomId = String(formData.get("roomId"));
  const seasonId = String(formData.get("seasonId"));
  const raw = String(formData.get("overridePrice") ?? "").trim();
  const overridePrice = raw === "" ? null : Number(raw);

  await setRoomRateOverride(roomId, seasonId, overridePrice !== null && Number.isFinite(overridePrice) ? overridePrice : null);
  revalidatePath("/admin/rates");
}
