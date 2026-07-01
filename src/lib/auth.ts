import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export const COOKIE_NAME = "cc_token";
const EXPIRY = "7d";

function getSecret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET not set");
  return new TextEncoder().encode(s);
}

// Magic-link tokens are signed with a DEDICATED secret, separate from JWT_SECRET
// (password sessions) and SCHEDULER_SECRET (/api/push). Rotating this kills every
// outstanding magic link without touching password logins or the push endpoint.
// Fails closed: if unset, no magic token can ever verify.
function getMagicSecret(): Uint8Array {
  const s = process.env.MAGIC_LINK_SECRET;
  if (!s) throw new Error("MAGIC_LINK_SECRET not set");
  return new TextEncoder().encode(s);
}

export async function signToken(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

// Mints the session cookie onto a NextResponse with the exact flags the login
// route has always used. Shared so password login and magic-link login produce
// an IDENTICAL cc_token cookie.
export async function setSession(res: NextResponse, role: "owner" | "demo"): Promise<NextResponse> {
  const token = await signToken({ auth: true, role });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return res;
}

// Signs a magic-link token with the DEDICATED MAGIC_LINK_SECRET. Kept here for
// local/testing parity; production links are minted by the Python email bot as a
// standard HS256 JWT with the same secret and { magic: true, role } payload.
export async function signMagicToken(role: "owner"): Promise<string> {
  return new SignJWT({ magic: true, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getMagicSecret());
}

// Verifies a magic-link token against MAGIC_LINK_SECRET only. Returns the payload
// or null on ANY error (bad signature, expired, or secret unset). Never falls
// back to JWT_SECRET.
export async function verifyMagicToken(token: string): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(token, getMagicSecret());
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Record<string, unknown> | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(): Promise<Response | null> {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
