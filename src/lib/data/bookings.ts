import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { seedBookings } from "./seed/bookings";
import type { Booking } from "@/lib/types";

/**
 * In-memory store used only when Supabase isn't configured, so the booking
 * flow (incl. the admin calendar) is fully testable without a database.
 * Starts pre-populated with seed bookings for a realistic admin/demo view;
 * resets on server restart — set NEXT_PUBLIC_SUPABASE_URL / ANON_KEY /
 * SUPABASE_SERVICE_ROLE_KEY for real persistence.
 */
const memoryBookings: Booking[] = [...seedBookings];

export function generateBookingCode(): string {
  return `BH-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function createBooking(booking: Booking): Promise<Booking> {
  if (isSupabaseConfigured()) {
    const admin = createAdminClient();
    if (admin) {
      const { data, error } = await admin.from("bookings").insert(booking).select().single();
      if (!error && data) return data as unknown as Booking;
    }
  }
  memoryBookings.push(booking);
  return booking;
}

export async function getBookingsForRoom(roomId: string, from: string, to: string): Promise<Booking[]> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("room_id", roomId)
        .neq("status", "cancelled")
        .lte("check_in", to)
        .gte("check_out", from);
      if (!error && data) return data as unknown as Booking[];
    }
  }
  return memoryBookings.filter((b) => b.roomId === roomId && b.status !== "cancelled" && b.checkIn < to && b.checkOut > from);
}

export async function isRoomAvailable(roomId: string, checkIn: string, checkOut: string): Promise<boolean> {
  const overlapping = await getBookingsForRoom(roomId, checkIn, checkOut);
  return overlapping.length === 0;
}

export async function getAllBookings(): Promise<Booking[]> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    if (supabase) {
      const { data, error } = await supabase.from("bookings").select("*").order("check_in", { ascending: true });
      if (!error && data) return data as unknown as Booking[];
    }
  }
  return memoryBookings;
}

export async function getBookingByCode(code: string): Promise<Booking | undefined> {
  const bookings = await getAllBookings();
  return bookings.find((b) => b.code === code);
}

export async function getBookingsForGuestEmail(email: string): Promise<Booking[]> {
  const bookings = await getAllBookings();
  return bookings.filter((b) => b.guest.email.toLowerCase() === email.toLowerCase());
}

async function mutateBooking(code: string, patch: Partial<Booking>): Promise<Booking | undefined> {
  if (isSupabaseConfigured()) {
    const admin = createAdminClient();
    if (admin) {
      const { data, error } = await admin.from("bookings").update(patch).eq("code", code).select().maybeSingle();
      if (!error && data) return data as unknown as Booking;
    }
  }
  const booking = memoryBookings.find((b) => b.code === code);
  if (booking) Object.assign(booking, patch);
  return booking;
}

export const CANCELLATION_MIN_DAYS_BEFORE = 5;

export function canCancelFreely(checkIn: string): boolean {
  const daysUntilCheckIn = (new Date(checkIn).getTime() - Date.now()) / 86_400_000;
  return daysUntilCheckIn >= CANCELLATION_MIN_DAYS_BEFORE;
}

export async function cancelBooking(code: string): Promise<Booking | undefined> {
  return mutateBooking(code, { status: "cancelled" });
}

export async function updateSpecialRequests(code: string, specialRequests: string): Promise<Booking | undefined> {
  return mutateBooking(code, { specialRequests });
}
