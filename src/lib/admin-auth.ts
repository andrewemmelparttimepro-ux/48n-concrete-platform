import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "48n-admin-session";
const SESSION_AGE_MS = 1000 * 60 * 60 * 24 * 14;

type SessionPayload = {
  exp: number;
};

function getSessionSecret() {
  return (
    process.env.FORTY8N_SESSION_SECRET ||
    process.env.PRAIRIE_SESSION_SECRET ||
    "48n-local-session-secret"
  );
}

export function getAdminPasscode() {
  return (
    process.env.FORTY8N_ADMIN_PASSCODE ||
    process.env.PRAIRIE_ADMIN_PASSCODE ||
    "48n-local-passcode"
  );
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");
}

function encodeToken(payload: SessionPayload) {
  const value = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${value}.${signPayload(value)}`;
}

function decodeToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [value, signature] = token.split(".");

  if (!value || !signature) {
    return null;
  }

  const expected = signPayload(value);
  const provided = Buffer.from(signature);
  const actual = Buffer.from(expected);

  if (
    provided.length !== actual.length ||
    !timingSafeEqual(provided, actual)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    ) as SessionPayload;

    if (!payload.exp || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return Boolean(decodeToken(token));
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/portal/login");
  }
}

export async function createAdminSession() {
  const cookieStore = await cookies();
  const token = encodeToken({
    exp: Date.now() + SESSION_AGE_MS,
  });

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_AGE_MS / 1000,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
