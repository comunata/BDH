import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRoomBySlug } from "@/lib/data/rooms";
import { getServices } from "@/lib/data/services";
import { getSeasons } from "@/lib/data/seasons";
import { getPromotionByCode, getVoucherByCode } from "@/lib/data/promotions";
import { calculateBookingPrice } from "@/lib/pricing";
import { createBooking, generateBookingCode, isRoomAvailable } from "@/lib/data/bookings";
import { sendEmail } from "@/lib/integrations/email";
import { buildWhatsappLink } from "@/lib/integrations/whatsapp";
import { getDictionary } from "@/lib/i18n";
import { isLocale, defaultLocale } from "@/lib/i18n/config";
import { renderTemplate } from "@/lib/i18n/template";
import { formatDate } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import type { Booking } from "@/lib/types";

const createSchema = z.object({
  roomSlug: z.string().min(1),
  checkIn: z.string().min(10),
  checkOut: z.string().min(10),
  adults: z.number().int().min(1).max(20),
  children: z.number().int().min(0).max(10).default(0),
  childAges: z.array(z.number().int().min(0).max(17)).default([]),
  extras: z.array(z.object({ serviceId: z.string(), quantity: z.number().int().min(1).default(1) })).default([]),
  promoCode: z.string().optional(),
  voucherCode: z.string().optional(),
  locale: z.string().optional(),
  guest: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(5),
  }),
  specialRequests: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", issues: parsed.error.issues }, { status: 400 });
  }
  const input = parsed.data;
  const locale = isLocale(input.locale ?? "") ? (input.locale as "ro" | "en") : defaultLocale;
  const dict = getDictionary(locale);

  if (new Date(input.checkOut) <= new Date(input.checkIn)) {
    return NextResponse.json({ error: "invalid_dates" }, { status: 422 });
  }

  const room = await getRoomBySlug(input.roomSlug);
  if (!room) return NextResponse.json({ error: "room_not_found" }, { status: 404 });

  if (input.adults > room.maxAdults || input.children > room.maxChildren) {
    return NextResponse.json({ error: "capacity_exceeded" }, { status: 422 });
  }

  const available = await isRoomAvailable(room.id, input.checkIn, input.checkOut);
  if (!available) {
    return NextResponse.json({ error: "room_unavailable" }, { status: 409 });
  }

  const [services, seasons, promotion, voucher] = await Promise.all([
    getServices(),
    getSeasons(),
    input.promoCode ? getPromotionByCode(input.promoCode) : Promise.resolve(undefined),
    input.voucherCode ? getVoucherByCode(input.voucherCode) : Promise.resolve(undefined),
  ]);

  const totals = calculateBookingPrice({
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

  const booking: Booking = {
    id: crypto.randomUUID(),
    code: generateBookingCode(),
    roomId: room.id,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    guests: { adults: input.adults, children: input.children, childAges: input.childAges, infants: 0 },
    extras: input.extras,
    promoCode: input.promoCode,
    voucherCode: input.voucherCode,
    guest: input.guest,
    specialRequests: input.specialRequests,
    status: "pending",
    totals,
    createdAt: new Date().toISOString(),
    source: "website",
  };

  const created = await createBooking(booking);

  const roomName = room.name[locale] ?? room.name.en;
  const emailVars = {
    propertyName: siteConfig.name,
    guestName: `${input.guest.firstName} ${input.guest.lastName}`,
    roomName,
    checkIn: formatDate(input.checkIn, locale === "ro" ? "ro-RO" : "en-GB"),
    checkOut: formatDate(input.checkOut, locale === "ro" ? "ro-RO" : "en-GB"),
  };

  await sendEmail({
    to: input.guest.email,
    subject: renderTemplate(dict.emails.bookingConfirmation.subject, emailVars),
    html: `<h1>${renderTemplate(dict.emails.bookingConfirmation.heading, emailVars)}</h1><p>${renderTemplate(
      dict.emails.bookingConfirmation.body,
      emailVars
    )}</p><p>${dict.booking.summary}: ${created.code}</p>`,
  });

  const whatsappMessage = renderTemplate(dict.whatsapp.confirmation, { ...emailVars, bookingCode: created.code });

  return NextResponse.json({
    booking: created,
    whatsappLink: buildWhatsappLink(whatsappMessage, siteConfig.contact.whatsapp),
  });
}
