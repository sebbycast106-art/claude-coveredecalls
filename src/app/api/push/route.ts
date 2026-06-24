import { timingSafeEqual } from "node:crypto";
import { db, dbAvailable } from "@/lib/db";
import { automationCache, runHistory } from "@/lib/schema";
import { PushPayloadSchema } from "@/lib/schemas";

// Bot keys are short slugs (e.g. "covered_calls"). Bound them so an authenticated
// push can't store an arbitrary/oversized key.
const BOT_KEY_RE = /^[a-z0-9_-]{1,40}$/;
// Cap the stored blob — a single upserted row per bot, but the limit stops a
// leaked-secret push from storing a huge payload.
const MAX_DATA_BYTES = 512_000;
const RUN_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Constant-time secret comparison — avoids the byte-by-byte timing side channel
// of `!==`. Fails closed when the expected secret is unset or lengths differ.
function secretsMatch(provided: string, expected: string): boolean {
  if (!expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!dbAvailable) {
    return Response.json({ ok: false, error: "no_database" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Accept the secret from a query param or the body (machine-to-machine; no cookie).
  const url = new URL(request.url);
  const secret =
    url.searchParams.get("secret") ?? (typeof body.secret === "string" ? body.secret : "");
  if (!secretsMatch(secret, process.env.SCHEDULER_SECRET ?? "")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Bot key — defaults to "covered_calls", validated as a bounded slug otherwise.
  const botKey = typeof body.bot === "string" ? body.bot : "covered_calls";
  if (!BOT_KEY_RE.test(botKey)) {
    return Response.json({ error: "Invalid bot key" }, { status: 400 });
  }

  // Data must be a plain object within the size cap before we persist it.
  if (typeof body.data !== "object" || body.data === null || Array.isArray(body.data)) {
    return Response.json({ error: "Invalid data" }, { status: 400 });
  }
  const rawData = body.data as Record<string, unknown>;
  if (JSON.stringify(rawData).length > MAX_DATA_BYTES) {
    return Response.json({ error: "Payload too large" }, { status: 413 });
  }

  // Validate the load-bearing fields so a malformed push can't render a
  // misleading EXIT/HOLD card. The engine owns the full shape; we guard the
  // fields the UI makes decisions on (action enum, recommendations array).
  const parsed = PushPayloadSchema.safeParse(rawData);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid payload schema", detail: parsed.error.issues.slice(0, 5) },
      { status: 422 }
    );
  }

  const now = new Date().toISOString();
  rawData.pushed_at = now;
  const stored = JSON.stringify(rawData);

  // Latest snapshot — single upserted row the UI reads.
  await db!
    .insert(automationCache)
    .values({ botKey, data: stored, pushedAt: now })
    .onConflictDoUpdate({
      target: automationCache.botKey,
      set: { data: stored, pushedAt: now },
    });

  // Append-only daily ledger so performance history survives the bot's ephemeral
  // runner. Keyed by the run's as_of date; a re-push for the same date overwrites.
  const asOf =
    typeof rawData.as_of === "string" && RUN_DATE_RE.test(rawData.as_of)
      ? rawData.as_of
      : now.slice(0, 10);
  await db!
    .insert(runHistory)
    .values({ runDate: asOf, data: stored, recordedAt: now })
    .onConflictDoUpdate({
      target: runHistory.runDate,
      set: { data: stored, recordedAt: now },
    });

  return Response.json({ ok: true });
}
