import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { setSession } from "@/lib/auth";
import { LoginSchema } from "@/lib/schemas";

// Lightweight per-IP rate limit (single-instance personal app). 5 attempts /
// 15 min; a leaked-link visitor can't brute-force the shared password.
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

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(request: Request) {
  if (rateLimited(clientIp(request))) {
    return Response.json({ error: "Too many attempts — wait a few minutes." }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "invalid_input" }, { status: 400 });
  const { password } = parsed.data;

  const ownerHash = process.env.APP_PASSWORD_HASH ?? "";
  const demoHash = process.env.DEMO_PASSWORD_HASH ?? "";

  // Local-dev convenience: with no hashes configured, any password logs in as
  // owner, EXCEPT the literal "demo" which loads the demo dataset (for testing
  // the shared-link experience without provisioning hashes).
  if (!ownerHash && !demoHash) {
    return setSession(NextResponse.json({ ok: true }), password === "demo" ? "demo" : "owner");
  }

  let role: "owner" | "demo" | null = null;
  try {
    if (ownerHash && (await bcrypt.compare(password, ownerHash))) role = "owner";
    else if (demoHash && (await bcrypt.compare(password, demoHash))) role = "demo";
  } catch {
    role = null;
  }

  if (!role) {
    // Constant delay on failure to blunt timing/brute-force.
    await wait(400);
    return Response.json({ error: "Incorrect access code" }, { status: 403 });
  }

  return setSession(NextResponse.json({ ok: true }), role);
}
