import { NextResponse } from "next/server";
import { createAdminSession, getAdminPasscode } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const passcode = String(formData.get("passcode") || "");

  if (passcode !== getAdminPasscode()) {
    return NextResponse.redirect(new URL("/portal/login?error=1", request.url));
  }

  await createAdminSession();
  return NextResponse.redirect(new URL("/portal", request.url));
}
