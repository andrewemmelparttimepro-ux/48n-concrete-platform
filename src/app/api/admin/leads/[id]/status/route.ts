import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { setLeadStatus } from "@/lib/store";

const schema = z.object({
  status: z.enum(["new", "contacted"]),
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
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/portal?error=lead", request.url));
  }

  await setLeadStatus(params.id, parsed.data.status);
  return NextResponse.redirect(new URL("/portal?updated=1", request.url));
}
