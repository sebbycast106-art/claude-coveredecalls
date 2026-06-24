import { desc, eq } from "drizzle-orm";
import { DEMO_PAYLOAD } from "@/data/demo";
import { getSession } from "@/lib/auth";
import type { HistoryRow } from "@/lib/contract";
import { db, dbAvailable } from "@/lib/db";
import { automationCache, runHistory } from "@/lib/schema";

const BOT_KEY = "covered_calls";

// Empty shape returned before the engine has pushed anything (or when the DB is
// unavailable). Matches the contract so the page renders a friendly empty state.
function emptyPayload() {
  return {
    schema_version: 2,
    generated_at: null,
    as_of: null,
    risk_free: null,
    data_delay_minutes: null,
    prices_are_modeled: true,
    stale: false,
    brief: "",
    flags: [] as string[],
    recommendations: [] as unknown[],
    portfolio: null,
    performance: {
      premium_collected_to_date: 0,
      realized_premium_ledger: [] as unknown[],
      spy_return: null as number | null,
      buyhold_return: null as number | null,
      covered_call_total_return: null as number | null,
      benchmark_window_start: null as string | null,
    },
  };
}

// Build a slim cumulative history for the demo so the trend chart has shape.
function demoHistory(): HistoryRow[] {
  const ledger = [...DEMO_PAYLOAD.performance.realized_premium_ledger].sort((a, b) =>
    a.event_date < b.event_date ? -1 : 1
  );
  let cum = 0;
  return ledger.map((e) => {
    cum += e.realized_pl;
    return {
      as_of: e.event_date,
      premium_collected_to_date: cum,
      spy_return: null,
      buyhold_return: null,
      writes: 0,
      stale: false,
    };
  });
}

function slimHistoryRow(raw: string): Record<string, unknown> | null {
  try {
    const d = JSON.parse(raw) as Record<string, unknown>;
    const perf = (d.performance ?? {}) as Record<string, unknown>;
    const recs = Array.isArray(d.recommendations) ? d.recommendations : [];
    const writes = recs.filter((r) => {
      const a = (r as Record<string, unknown>).action;
      return a === "ENTER" || a === "SELL_CALL";
    }).length;
    return {
      as_of: d.as_of ?? null,
      premium_collected_to_date: perf.premium_collected_to_date ?? null,
      spy_return: perf.spy_return ?? null,
      buyhold_return: perf.buyhold_return ?? null,
      writes,
      stale: d.stale ?? false,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date().toISOString();
  const role = session.role === "demo" ? "demo" : "owner";

  // DEMO role: serve fabricated data only. Real positions never reach this path.
  if (role === "demo") {
    return Response.json({
      ...DEMO_PAYLOAD,
      mode: "demo",
      fetched_at: now,
      history: demoHistory(),
    });
  }

  // OWNER role: real pushed data.
  if (!dbAvailable || !db) {
    return Response.json({
      ...emptyPayload(),
      mode: "owner",
      unavailable: true,
      fetched_at: now,
      history: [],
    });
  }

  const [cacheRows, historyRows] = await Promise.all([
    db.select().from(automationCache).where(eq(automationCache.botKey, BOT_KEY)),
    db.select().from(runHistory).orderBy(desc(runHistory.runDate)).limit(180),
  ]);

  const history = historyRows
    .map((r) => slimHistoryRow(r.data))
    .filter((r): r is Record<string, unknown> => r !== null)
    .reverse();

  const cached = cacheRows[0];
  if (cached) {
    try {
      const data = JSON.parse(cached.data) as Record<string, unknown>;
      return Response.json({ ...data, mode: "owner", fetched_at: now, history });
    } catch {
      return Response.json({
        ...emptyPayload(),
        mode: "owner",
        stale: true,
        fetched_at: now,
        history,
        _source: "parse_error",
      });
    }
  }

  return Response.json({
    ...emptyPayload(),
    mode: "owner",
    fetched_at: now,
    history,
    _source: "no_data",
  });
}
