import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRoomBySlug } from "@/lib/data/rooms";
import { getServices } from "@/lib/data/services";
import { getSeasons } from "@/lib/data/seasons";
import { getPromotionByCode, getVoucherByCode } from "@/lib/data/promotions";
import { calculateBookingPrice } from "@/lib/pricing";

const quoteSchema = z.object({
  roomSlug: z.string().min(1),
  checkIn: z.string().min(10),
  checkOut: z.string().min(10),
  adults: z.number().int().min(1).max(20),
  children: z.number().int().min(0).max(10).default(0),
  childAges: z.array(z.number().int().min(0).max(17)).default([]),
  extras: z.array(z.object({ serviceId: z.string(), quantity: z.number().int().min(1).default(1) })).default([]),
  promoCode: z.string().optional(),
  voucherCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", issues: parsed.error.issues }, { status: 400 });
  }
  const input = parsed.data;

  if (new Date(input.checkOut) <= new Date(input.checkIn)) {
    return NextResponse.json({ error: "invalid_dates" }, { status: 422 });
  }

  const room = await getRoomBySlug(input.roomSlug);
  if (!room) return NextResponse.json({ error: "room_not_found" }, { status: 404 });

  if (input.adults > room.maxAdults || input.children > room.maxChildren) {
    return NextResponse.json({ error: "capacity_exceeded" }, { status: 422 });
  }

  const [services, seasons, promotion, voucher] = await Promise.all([
    getServices(),
    getSeasons(),
    input.promoCode ? getPromotionByCode(input.promoCode) : Promise.resolve(undefined),
    input.voucherCode ? getVoucherByCode(input.voucherCode) : Promise.resolve(undefined),
  ]);

  try {
    const breakdown = calculateBookingPrice({
      room,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      guests: { adults: input.adults, children: input.children, childAges: input.childAges, infants: 0 },
      extras: input.extras,
      seasons,
      services,
      promotion,
      voucher,
    });
    return NextResponse.json({
      breakdown,
      promoApplied: Boolean(promotion),
      voucherApplied: Boolean(voucher),
    });
  } catch {
    return NextResponse.json({ error: "invalid_dates" }, { status: 422 });
  }
}
