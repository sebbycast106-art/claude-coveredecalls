// ── Theta Desk payload contract (schema_version 2) ──────────────────────────
// THE single source of truth for the shape the Python engine pushes and the UI
// renders. Keep this in lockstep with covered-call-bot's recommendation_to_dict
// + build_payload. Bump SCHEMA_VERSION on any breaking change.

export const SCHEMA_VERSION = 2;

// Widened action enum — the unmissable source of each card's verb/color/CTA.
// NO_TRADE retained only for data-degraded / error rows.
export type Action =
  | "ENTER" // Sell to Open  — flat, write a new call
  | "HOLD" // Hold Position — open call, keep it
  | "ROLL" // Roll          — buy-to-close + sell-to-open later/higher
  | "CLOSE" // Buy to Close  — open call, exit, no replacement
  | "LET_ASSIGN" // Let Assign — hold into assignment on purpose (tax-preferred)
  | "STAND_ASIDE" // No Trade  — flat, nothing worth writing
  | "NO_TRADE"; // data-degraded / error row

export type PositionState = "FLAT" | "OPEN_WINNING" | "OPEN_ITM_RISK" | "OPEN_NEUTRAL";

export type ActionTrigger =
  | "PROFIT_50PCT"
  | "DTE_21"
  | "EXTRINSIC_DEPLETED"
  | "DELTA_DEFENSE"
  | "TAX_PREFER_ASSIGN"
  | "BELOW_TARGET"
  | "STRIKE_BELOW_BASIS"
  | "ASSIGNMENT_RISK_CEILING"
  | "NO_LIQUID_STRIKE"
  | "NONE";

export type Urgency = "ROUTINE" | "SOON" | "ACT_TODAY";

// Present iff a short call is currently open on the underlying; null when flat.
export interface OpenCall {
  open_contract_symbol: string;
  open_strike: number;
  open_expiry: string;
  open_dte: number;
  open_contracts: number;
  entry_date: string;
  days_held: number;
  entry_premium_per_share: number;
  current_call_mark: number; // modeled cost-to-close per share
  pct_max_profit_captured: number; // 0..1  (1 − mark/entry)
  unrealized_option_pl_per_share: number; // + = the short call is winning
  unrealized_option_pl_total: number;
  entry_delta: number | null;
  current_delta: number;
  extrinsic_value_remaining: number; // per share
  is_itm: boolean;
  distance_to_strike: number; // signed fraction: (strike − spot) / spot
  assignment_prob_now: number; // real-world, 0..1
  cost_to_close_total: number;
  qcc_currently_itm: boolean; // ITM QCC suspends the holding period
  lot_holding_period: "LT" | "ST";
  strike_ge_basis: boolean;
}

// Populated iff action === "ROLL".
export interface RollTarget {
  new_contract_symbol: string;
  new_strike: number;
  new_expiry: string;
  new_dte: number;
  new_delta: number;
  net_credit_per_share: number; // signed; ≥0 unless roll_is_defensive
  net_credit_total: number;
  roll_is_defensive: boolean;
  preserves_qcc: boolean;
}

export interface Recommendation {
  ticker: string;
  action: Action;
  position_state: PositionState;
  urgency: Urgency;
  headline: string; // imperative one-liner, rendered verbatim
  action_trigger: ActionTrigger | null;

  // The contract under recommendation (ENTER target; for ROLL see roll_target).
  contracts: number;
  contract_symbol: string | null;
  strike: number | null;
  expiry: string | null;
  dte: number | null;
  delta: number | null;
  prob_assignment_rw: number | null; // headline probability
  prob_assignment_rn: number | null; // risk-neutral (methodology detail)
  net_premium_per_share: number | null;
  gross_premium_total: number | null;
  monthly_yield: number | null;
  annualized_yield: number | null;
  after_tax_score: number | null; // RANKING score, NOT bankable $ — never shown as profit
  foregone_upside_total: number | null; // honest counterweight to premium income
  breakeven: number | null;
  spot: number | null;
  prior_close: number | null;
  lt_shares_written: number;
  st_shares_written: number;
  backing_lots: string[];
  qcc_qualified: boolean | null;
  below_target: boolean;
  ex_div_before_expiry: boolean;
  earnings_before_expiry: boolean;

  open_call: OpenCall | null;
  roll_target: RollTarget | null;

  rationale: string;
  action_reason: string | null;
  no_trade_reason: string | null;
}

export interface Portfolio {
  total_shares: number;
  covered_shares: number;
  pct_book_covered: number; // 0..1
  uncovered_shares: number;
  open_call_count: number;
  expected_monthly_income: number; // modeled, labeled in UI
  realized_premium_to_date: number;
  open_premium_at_risk: number;
  total_unrealized_option_pl: number;
  lt_shares_exposed: number;
  st_shares_exposed: number;
  as_of: string | null;
}

export interface RealizedLedgerEntry {
  event_date: string;
  ticker: string;
  contract_symbol: string;
  event_type: "EXPIRED" | "BOUGHT_TO_CLOSE" | "ASSIGNED" | "ROLLED";
  gross_premium: number;
  close_cost: number;
  realized_pl: number;
  after_tax_pl: number;
  tax_character: "LTCG" | "STCG" | "PREMIUM";
}

export interface Performance {
  premium_collected_to_date: number;
  realized_premium_ledger: RealizedLedgerEntry[];
  spy_return: number | null;
  buyhold_return: number | null;
  covered_call_total_return: number | null; // stock P/L + realized premium, net of tax
  benchmark_window_start: string | null;
}

export interface HistoryRow {
  as_of: string | null;
  premium_collected_to_date: number | null;
  spy_return: number | null;
  buyhold_return: number | null;
  writes: number;
  stale: boolean;
}

export interface CoveredCallsPayload {
  schema_version: number;
  generated_at: string | null;
  as_of: string | null;
  risk_free: number | null;
  data_delay_minutes: number | null;
  prices_are_modeled: boolean;
  stale: boolean;
  brief: string;
  flags: string[];
  recommendations: Recommendation[];
  portfolio: Portfolio | null;
  performance: Performance;

  // App-added (not from the engine):
  mode?: "owner" | "demo";
  history?: HistoryRow[];
  fetched_at?: string;
  unavailable?: boolean;
  _source?: string;
}
