import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getBookingByCode, cancelBooking, updateSpecialRequests, canCancelFreely } from "@/lib/data/bookings";

const patchSchema = z.object({
  action: z.enum(["cancel", "special_requests"]),
  specialRequests: z.string().max(2000).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const booking = await getBookingByCode(code);
  if (!booking) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  if (parsed.data.action === "cancel") {
    const free = canCancelFreely(booking.checkIn);
    const updated = await cancelBooking(code);
    return NextResponse.json({ booking: updated, freeCancellation: free });
  }

  const updated = await updateSpecialRequests(code, parsed.data.specialRequests ?? "");
  return NextResponse.json({ booking: updated });
}
