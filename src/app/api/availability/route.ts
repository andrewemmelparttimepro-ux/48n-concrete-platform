import { NextResponse } from "next/server";
import { getAvailabilitySnapshot } from "@/lib/store";

export async function GET() {
  const days = await getAvailabilitySnapshot();

  return NextResponse.json({
    days,
  });
}
