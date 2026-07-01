import type { Action, ActionTrigger } from "@/lib/contract";

// ── Action taxonomy metadata ────────────────────────────────────────────────
// Maps every engine action to its verb, the plain-English thing the OWNER does
// (analyze-only — the app never acts), its color family, and an icon. The 5-hue
// palette is collapsed to THREE families (redundant word+glyph encoding means
// zero CVD loss): navy = open a new call, orange = modify/exit (risk), grey =
// hold / nothing to do.

export type Tone = "enter" | "risk" | "neutral" | "hold";

export interface ActionMeta {
  label: string;
  verb: string; // the short, confident giant-verb shown on the Dawn card
  ownerVerb: string;
  framing: string;
  tone: Tone;
  iconPath: string;
}

export const ACTION_META: Record<Action, ActionMeta> = {
  ENTER: {
    label: "Sell to Open",
    verb: "Sell this",
    ownerVerb: "Consider selling to open a new covered call",
    framing: "Not in a call — a write looks worthwhile",
    tone: "enter",
    iconPath:
      "M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3",
  },
  HOLD: {
    label: "Hold",
    verb: "Hold",
    ownerVerb: "Keep the open call — no action needed",
    framing: "In a call — stay in it",
    tone: "hold",
    iconPath: "M15.75 5.25v13.5m-7.5-13.5v13.5",
  },
  ROLL: {
    label: "Roll",
    verb: "Roll it",
    ownerVerb: "Consider rolling — buy to close, then sell a later call",
    framing: "In a call — move it, for a net credit",
    tone: "risk",
    iconPath:
      "M16.023 9.348h4.992V4.356M3.5 14.652h4.992v4.992M4.5 9.349a7.5 7.5 0 0 1 13.789-2.7M19.5 14.65a7.5 7.5 0 0 1-13.79 2.7",
  },
  CLOSE: {
    label: "Buy to Close",
    verb: "Close it",
    ownerVerb: "Consider buying to close — take the win, no replacement",
    framing: "In a call — get out of it",
    tone: "risk",
    iconPath:
      "M12 9.75V3m0 0L7.5 7.5M12 3l4.5 4.5M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5",
  },
  LET_ASSIGN: {
    label: "Let Assign",
    verb: "Let it assign",
    ownerVerb: "Hold into assignment on purpose — the tax-smart exit",
    framing: "In a call — let it assign (tax-preferred)",
    tone: "hold",
    iconPath: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  },
  STAND_ASIDE: {
    label: "No Trade",
    verb: "Hold",
    ownerVerb: "Nothing worth writing this cycle",
    framing: "Not in a call — and not worth entering yet",
    tone: "hold",
    iconPath: "M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  },
  NO_TRADE: {
    label: "No Trade",
    verb: "Hold",
    ownerVerb: "Stand down — data was degraded this cycle",
    framing: "No reliable read this cycle",
    tone: "neutral",
    iconPath: "M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  },
};

// Light-mode class bundles per family (tokens in globals @theme).
export const TONE_CLASSES: Record<
  Tone,
  {
    rail: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    text: string;
    on: string;
  }
> = {
  enter: {
    rail: "bg-accent",
    badgeBg: "bg-accent-soft",
    badgeText: "text-accent",
    badgeBorder: "border-accent/20",
    text: "text-accent",
    on: "text-accent",
  },
  risk: {
    rail: "bg-risk",
    badgeBg: "bg-risk-soft",
    badgeText: "text-risk",
    badgeBorder: "border-risk/25",
    text: "text-risk",
    on: "text-risk",
  },
  neutral: {
    rail: "bg-line-strong",
    badgeBg: "bg-sunken",
    badgeText: "text-muted",
    badgeBorder: "border-line",
    text: "text-muted",
    on: "text-muted",
  },
  hold: {
    rail: "bg-hold",
    badgeBg: "bg-hold-soft",
    badgeText: "text-hold",
    badgeBorder: "border-hold/25",
    text: "text-hold",
    on: "text-hold",
  },
};

export const TONE_VAR: Record<Tone, string> = {
  enter: "var(--color-accent)",
  risk: "var(--color-risk)",
  neutral: "var(--color-line-strong)",
  hold: "var(--color-hold)",
};

// House-rule label for the trigger that fired — used in the methodology appendix,
// not on the exhibit (kept off the cards per the text-cut discipline).
export const TRIGGER_LABEL: Record<ActionTrigger, string> = {
  PROFIT_50PCT: "house rule: take the win near ~50% of max profit",
  DTE_21: "house rule: manage at 21 days to expiry",
  EXTRINSIC_DEPLETED: "little time value left to collect",
  DELTA_DEFENSE: "delta rising — defend before it runs ITM",
  TAX_PREFER_ASSIGN: "assignment is the tax-preferred exit here",
  BELOW_TARGET: "premium is below the ~2%/mo house target",
  STRIKE_BELOW_BASIS: "no strike clears your cost basis",
  ASSIGNMENT_RISK_CEILING: "every safe strike exceeds the assignment-risk ceiling",
  NO_LIQUID_STRIKE: "no liquid strike at a worthwhile premium",
  ASSIGNMENT_ESCAPE: "assignment odds climbing — roll up and out to escape",
  DEPRESSED_UNDERLYING: "house rule: don't write below the 50-day average",
  HIGH_IV_WEAK_TAPE: "extreme IV with a weak tape — don't cap a rebound",
  NONE: "",
};

export function isOpenState(state: string): boolean {
  return state.startsWith("OPEN_");
}
