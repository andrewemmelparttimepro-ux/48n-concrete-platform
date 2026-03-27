import { NextResponse } from "next/server";
import { z } from "zod";
import { createLeadRequest } from "@/lib/store";

const schema = z.object({
  customerName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(30),
  email: z.string().trim().email().max(120),
  company: z.string().trim().max(80).optional(),
  serviceInterest: z.string().trim().min(3).max(80),
  message: z.string().trim().min(10).max(1200),
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Missing or invalid quote details.",
      },
      { status: 422 },
    );
  }

  const lead = await createLeadRequest(parsed.data);

  return NextResponse.json({
    leadId: lead.id,
  });
}
