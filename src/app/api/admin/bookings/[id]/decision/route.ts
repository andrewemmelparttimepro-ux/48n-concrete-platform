import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { setBookingDecision } from "@/lib/store";

const schema = z.object({
  status: z.enum(["approved", "denied"]),
  note: z.string().trim().max(500).optional(),
});

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: Context) {
  await requireAdmin();

  const params = await context.params;
  const formData = await request.formData();
  const parsed = schema.safeParse({
    status: formData.get("status"),
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/portal?error=decision", request.url));
  }

  await setBookingDecision(params.id, parsed.data.status, parsed.data.note);
  return NextResponse.redirect(new URL("/portal?updated=1", request.url));
}
