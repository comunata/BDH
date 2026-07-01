import type { Room, Season, ExtraService, Promotion, GiftVoucher, BookingGuestCounts, BookingExtra, PriceBreakdown, PriceLine } from "@/lib/types";

export const FREE_CHILD_AGE_THRESHOLD = 6;
export const TOURIST_TAX_PER_PERSON_PER_NIGHT = 2;
export const WEEKLY_STAY_DISCOUNT = 0.05;
export const WEEKLY_STAY_MIN_NIGHTS = 7;

export function eachNight(checkIn: string, checkOut: string): Date[] {
  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);
  const nights: Date[] = [];
  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    nights.push(new Date(d));
  }
  return nights;
}

function seasonForDate(date: Date, seasons: Season[]): Season | undefined {
  const time = date.getTime();
  return seasons.find((s) => time >= new Date(`${s.startDate}T00:00:00`).getTime() && time <= new Date(`${s.endDate}T23:59:59`).getTime());
}

function isWeekendNight(date: Date): boolean {
  const day = date.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
  return day === 5 || day === 6;
}

/** Guests old enough to be charged per-person (adults + children at/above the free-stay age threshold). */
function chargeableGuestCount(guests: BookingGuestCounts): number {
  const chargeableChildren = guests.childAges.filter((age) => age >= FREE_CHILD_AGE_THRESHOLD).length;
  return guests.adults + chargeableChildren;
}

export interface PricingInput {
  room: Room;
  checkIn: string;
  checkOut: string;
  guests: BookingGuestCounts;
  extras: BookingExtra[];
  seasons: Season[];
  services: ExtraService[];
  promotion?: Promotion;
  voucher?: GiftVoucher;
  currency?: string;
}

export function calculateBookingPrice(input: PricingInput): PriceBreakdown {
  const { room, checkIn, checkOut, guests, extras, seasons, services, promotion, voucher, currency = "EUR" } = input;
  const nights = eachNight(checkIn, checkOut);
  if (nights.length < 1) {
    throw new Error("invalid_dates");
  }

  const lines: PriceLine[] = [];

  let roomSubtotal = 0;
  for (const night of nights) {
    const season = seasonForDate(night, seasons);
    const seasonMultiplier = season?.multiplier ?? 1;
    const weekendMultiplier = season && isWeekendNight(night) ? season.weekendMultiplier : 1;
    roomSubtotal += room.basePrice * seasonMultiplier * weekendMultiplier;
  }

  let weeklyDiscount = 0;
  if (nights.length >= WEEKLY_STAY_MIN_NIGHTS) {
    weeklyDiscount = roomSubtotal * WEEKLY_STAY_DISCOUNT;
    lines.push({ label: `Reducere sejur ${nights.length}+ nopți`, amount: -weeklyDiscount });
  }
  roomSubtotal -= weeklyDiscount;
  lines.unshift({ label: `Cazare (${nights.length} ${nights.length === 1 ? "noapte" : "nopți"})`, amount: roomSubtotal });

  const chargeableGuests = chargeableGuestCount(guests);
  let extrasSubtotal = 0;
  for (const extra of extras) {
    const service = services.find((s) => s.id === extra.serviceId);
    if (!service) continue;
    const quantity = Math.max(1, extra.quantity);
    let amount = 0;
    switch (service.chargeType) {
      case "per_person":
        amount = service.price * chargeableGuests * quantity;
        break;
      case "per_night":
        amount = service.price * nights.length * quantity;
        break;
      case "per_room":
      case "per_booking":
      default:
        amount = service.price * quantity;
        break;
    }
    extrasSubtotal += amount;
    lines.push({ label: service.name.ro, amount });
  }

  let discountAmount = 0;
  const preDiscountSubtotal = roomSubtotal + extrasSubtotal;
  if (promotion && promotion.active) {
    discountAmount = promotion.type === "percentage" ? preDiscountSubtotal * (promotion.value / 100) : promotion.value;
    discountAmount = Math.min(discountAmount, preDiscountSubtotal);
    lines.push({ label: `Cod promoțional ${promotion.code}`, amount: -discountAmount });
  }

  const taxAmount = chargeableGuests * nights.length * TOURIST_TAX_PER_PERSON_PER_NIGHT;
  lines.push({ label: "Taxă turistică", amount: taxAmount });

  const runningTotal = preDiscountSubtotal - discountAmount + taxAmount;
  let voucherApplied = 0;
  if (voucher && voucher.active) {
    voucherApplied = Math.min(voucher.balance, runningTotal);
    if (voucherApplied > 0) lines.push({ label: `Voucher cadou ${voucher.code}`, amount: -voucherApplied });
  }

  const total = Math.max(0, runningTotal - voucherApplied);

  return {
    nights: nights.length,
    roomSubtotal,
    extrasSubtotal,
    discountAmount,
    taxAmount,
    voucherApplied,
    total,
    lines,
    currency,
  };
}
