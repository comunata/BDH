import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getBookingByCode, cancelBooking, updateSpecialRequests, canCancelFreely } from "@/lib/data/bookings";
import { getPortalSession } from "@/lib/portal/session";
import { checkRateLimit } from "@/lib/rate-limit";

const patchSchema = z.object({
  action: z.enum(["cancel", "special_requests"]),
  specialRequests: z.string().max(2000).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const rateLimited = checkRateLimit(request, "portal-booking-patch");
  if (rateLimited) return rateLimited;

  const { code } = await params;
  const booking = await getBookingByCode(code);
  if (!booking) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // Authorization: the caller must be an authenticated portal session whose
  // email matches the booking's guest email. This closes an IDOR where any
  // caller could PATCH (cancel / edit special requests on) any booking code,
  // since the code alone is guessable/enumerable and this route used to
  // trust it as sufficient proof of ownership.
  const session = await getPortalSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (session.email.toLowerCase() !== booking.guest.email.toLowerCase()) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

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
