import { NextRequest, NextResponse } from "next/server";
import { getBookingByCode } from "@/lib/data/bookings";
import { getRooms } from "@/lib/data/rooms";
import { generateBookingIcs } from "@/lib/integrations/calendar";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const booking = await getBookingByCode(code);
  if (!booking) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const rooms = await getRooms();
  const roomName = rooms.find((r) => r.id === booking.roomId)?.name.ro ?? "Cazare";
  const ics = generateBookingIcs(booking, roomName);

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${booking.code}.ics"`,
    },
  });
}
