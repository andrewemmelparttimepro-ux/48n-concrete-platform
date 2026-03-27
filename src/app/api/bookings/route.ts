import { NextResponse } from "next/server";
import { z } from "zod";
import { createBookingRequest } from "@/lib/store";

const schema = z.object({
  customerName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(30),
  company: z.string().trim().max(80).optional(),
  location: z.string().trim().regex(/^\d{5}$/),
  roughYardage: z.coerce.number().positive().max(5000),
  notes: z.string().trim().max(600).optional(),
  requestedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  requestedSlotKey: z.enum(["early", "midday", "afternoon"]),
  source: z.enum(["web", "pwa"]).default("web"),
  serviceZone: z.enum(["minot", "travel", "unknown"]).optional(),
  distanceMiles: z.coerce.number().min(0).max(1000).optional(),
  travelBufferMinutes: z.coerce.number().int().min(0).max(600).optional(),
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Missing or invalid booking details.",
      },
      { status: 422 },
    );
  }

  try {
    const { request: booking, queuePosition } = await createBookingRequest(
      parsed.data,
    );

    return NextResponse.json({
      requestId: booking.id,
      queuePosition,
      scheduledFor: `${booking.requestedDate} · ${booking.requestedSlotLabel}`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The booking request could not be created.",
      },
      { status: 409 },
    );
  }
}
