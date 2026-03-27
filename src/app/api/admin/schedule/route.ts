import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { clearScheduleOverride, updateScheduleOverride } from "@/lib/store";

const updateSchema = z.object({
  mode: z.enum(["slot", "day", "clear-slot", "clear-day"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slotKey: z.enum(["early", "midday", "afternoon"]).optional(),
  status: z.enum(["open", "limited", "full", "default"]).optional(),
  note: z.string().trim().max(500).optional(),
});

export async function POST(request: Request) {
  await requireAdmin();

  const formData = await request.formData();
  const parsed = updateSchema.safeParse({
    mode: formData.get("mode"),
    date: formData.get("date"),
    slotKey: formData.get("slotKey") || undefined,
    status: formData.get("status") || undefined,
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/portal?error=schedule", request.url));
  }

  if (parsed.data.mode === "slot") {
    await updateScheduleOverride({
      date: parsed.data.date,
      slotKey: parsed.data.slotKey,
      status: parsed.data.status || "default",
      note: parsed.data.note,
      closeDay: false,
    });
  }

  if (parsed.data.mode === "day") {
    await updateScheduleOverride({
      date: parsed.data.date,
      status: "default",
      note: parsed.data.note,
      closeDay: true,
    });
  }

  if (parsed.data.mode === "clear-slot" && parsed.data.slotKey) {
    await clearScheduleOverride({
      date: parsed.data.date,
      slotKey: parsed.data.slotKey,
    });
  }

  if (parsed.data.mode === "clear-day") {
    await clearScheduleOverride({
      date: parsed.data.date,
      clearDay: true,
    });
  }

  return NextResponse.redirect(new URL("/portal?updated=1", request.url));
}
