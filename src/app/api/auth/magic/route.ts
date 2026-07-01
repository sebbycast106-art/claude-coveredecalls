import { NextResponse } from "next/server";
import { setSession, verifyMagicToken } from "@/lib/auth";

// Same per-IP rate limit as the login route (5 attempts / 15 min). Replicated
// here to keep the shared-file footprint minimal; a leaked/guessed link can't be
// hammered against this endpoint. Per-instance in-memory state, like login.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, { count: number; first: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || now - rec.first > WINDOW_MS) {
    attempts.set(ip, { count: 1, first: now });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_ATTEMPTS;
}

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "local";
}

export async function GET(request: Request) {
  const loginUrl = new URL("/login", request.url);

  // Over the limit: redirect generically, reveal nothing, set no cookie.
  if (rateLimited(clientIp(request))) {
    return NextResponse.redirect(loginUrl);
  }

  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(loginUrl);
  }

  // jose enforces exp; we additionally require the magic-flag and owner role.
  const payload = await verifyMagicToken(token);
  if (!payload || payload.magic !== true || payload.role !== "owner") {
    // Generic redirect on ANY failure — no verification oracle.
    return NextResponse.redirect(loginUrl);
  }

  // 302 to the owner view (not a JSON 200, so email link-preview/prefetch bots
  // don't scrape a body) and mint the normal 7-day owner session on it.
  return setSession(NextResponse.redirect(new URL("/", request.url)), "owner");
}
