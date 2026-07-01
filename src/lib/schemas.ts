import { z } from "zod";

export const LoginSchema = z.object({
  password: z.string().min(1, "Password required"),
});

// ── Push payload validation (schema_version 2) ──────────────────────────────
// The ingest route validates the engine's payload before storing it, so a
// malformed push can't later render a misleading EXIT/HOLD card. We validate
// the load-bearing fields and pass the rest through (.passthrough) — the engine
// owns the full shape; the app guards the fields the UI makes decisions on.

const ActionEnum = z.enum([
  "ENTER",
  "HOLD",
  "ROLL",
  "CLOSE",
  "LET_ASSIGN",
  "STAND_ASIDE",
  "NO_TRADE",
]);

const RecommendationCore = z
  .object({
    ticker: z.string().min(1).max(8),
    action: ActionEnum,
    position_state: z.string().optional(),
    headline: z.string().optional(),
    open_call: z.union([z.record(z.string(), z.unknown()), z.null()]).optional(),
    roll_target: z.union([z.record(z.string(), z.unknown()), z.null()]).optional(),
    // Trend fields — validated defensively so a malformed push can't store a
    // non-array (or wrong-typed value) the price chart would then choke on.
    recent_closes: z.array(z.number()).nullable().optional(),
    sma_50: z.number().nullable().optional(),
    sma_200: z.number().nullable().optional(),
    week_high: z.number().nullable().optional(),
    week_low: z.number().nullable().optional(),
    pct_vs_sma_50: z.number().nullable().optional(),
    underlying_depressed: z.boolean().nullable().optional(),
  })
  .passthrough();

export const PushPayloadSchema = z
  .object({
    schema_version: z.number().int().optional(),
    as_of: z.union([z.string(), z.null()]).optional(),
    generated_at: z.union([z.string(), z.null()]).optional(),
    stale: z.boolean().optional(),
    recommendations: z.array(RecommendationCore),
  })
  .passthrough();

export type PushPayload = z.infer<typeof PushPayloadSchema>;
