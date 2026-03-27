import { NextResponse } from "next/server";
import { z } from "zod";
import { getPublicBookingStatuses } from "@/lib/store";

const querySchema = z.array(z.string().trim().regex(/^48N-[A-Z0-9]{6}$/)).max(6);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse(searchParams.getAll("id"));

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid booking request lookup.",
      },
      { status: 422 },
    );
  }

  const requests = await getPublicBookingStatuses(parsed.data);

  return NextResponse.json({
    requests,
  });
}
