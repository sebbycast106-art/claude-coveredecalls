import type { Action, ActionTrigger } from "@/lib/contract";

// ── Action taxonomy metadata ────────────────────────────────────────────────
// One place that maps every engine action to its verb, the plain-English thing
// the OWNER does at their broker (analyze-only — the app never acts), its color
// family, and an icon. Components read from here so the taxonomy stays DRY.

export type Tone = "enter" | "hold" | "roll" | "exit" | "neutral";

export interface ActionMeta {
  /** Loud verb shown as the card answer. */
  label: string;
  /** Plain-English broker action — what the owner does, never what the app does. */
  ownerVerb: string;
  /** "are you in it?" framing line for the lifecycle context. */
  framing: string;
  tone: Tone;
  /** 24×24 stroke icon path. */
  iconPath: string;
}

export const ACTION_META: Record<Action, ActionMeta> = {
  ENTER: {
    label: "Sell to Open",
    ownerVerb: "Consider selling to open a new covered call",
    framing: "Not in a call — a write looks worthwhile",
    tone: "enter",
    iconPath:
      "M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3",
  },
  HOLD: {
    label: "Hold",
    ownerVerb: "Keep the open call — no action needed",
    framing: "In a call — stay in it",
    tone: "hold",
    iconPath: "M15.75 5.25v13.5m-7.5-13.5v13.5",
  },
  ROLL: {
    label: "Roll",
    ownerVerb: "Consider rolling — buy to close, then sell a later call",
    framing: "In a call — move it, for a net credit",
    tone: "roll",
    iconPath:
      "M16.023 9.348h4.992V4.356M3.5 14.652h4.992v4.992M4.5 9.349a7.5 7.5 0 0 1 13.789-2.7M19.5 14.65a7.5 7.5 0 0 1-13.79 2.7",
  },
  CLOSE: {
    label: "Buy to Close",
    ownerVerb: "Consider buying to close — take the win, no replacement",
    framing: "In a call — get out of it",
    tone: "exit",
    iconPath:
      "M12 9.75V3m0 0L7.5 7.5M12 3l4.5 4.5M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5",
  },
  LET_ASSIGN: {
    label: "Let Assign",
    ownerVerb: "Hold into assignment on purpose — it's the tax-smart exit",
    framing: "In a call — let it assign (tax-preferred)",
    tone: "hold",
    iconPath: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  },
  STAND_ASIDE: {
    label: "No Trade",
    ownerVerb: "Nothing worth writing this cycle",
    framing: "Not in a call — and not worth entering yet",
    tone: "neutral",
    iconPath: "M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  },
  NO_TRADE: {
    label: "No Trade",
    ownerVerb: "Stand down — data was degraded this cycle",
    framing: "No reliable read this cycle",
    tone: "neutral",
    iconPath: "M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  },
};

// Tailwind class bundles per tone (colors live in globals @theme).
export const TONE_CLASSES: Record<
  Tone,
  {
    rail: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    tint: string;
    on: string;
    text: string;
  }
> = {
  enter: {
    rail: "bg-enter",
    badgeBg: "bg-enter/15",
    badgeText: "text-enter-on",
    badgeBorder: "border-enter/30",
    tint: "bg-enter-tint",
    on: "text-enter-on",
    text: "text-enter",
  },
  hold: {
    rail: "bg-hold",
    badgeBg: "bg-hold/15",
    badgeText: "text-hold-on",
    badgeBorder: "border-hold/30",
    tint: "bg-hold-tint",
    on: "text-hold-on",
    text: "text-hold",
  },
  roll: {
    rail: "bg-roll",
    badgeBg: "bg-roll/15",
    badgeText: "text-roll-on",
    badgeBorder: "border-roll/30",
    tint: "bg-roll-tint",
    on: "text-roll-on",
    text: "text-roll",
  },
  exit: {
    rail: "bg-exit",
    badgeBg: "bg-exit/15",
    badgeText: "text-exit-on",
    badgeBorder: "border-exit/30",
    tint: "bg-exit-tint",
    on: "text-exit-on",
    text: "text-exit",
  },
  neutral: {
    rail: "bg-neutral",
    badgeBg: "bg-neutral/15",
    badgeText: "text-neutral-on",
    badgeBorder: "border-neutral/30",
    tint: "bg-neutral-tint",
    on: "text-neutral-on",
    text: "text-neutral",
  },
};

// Human-readable "house rule" label for the trigger that fired. Always framed as
// a house rule — never attributed to an authority (Fidelity declines numeric
// roll rules; the 50% / 21-DTE figures are conventions, not law).
export const TRIGGER_LABEL: Record<ActionTrigger, string> = {
  PROFIT_50PCT: "house rule: take the win at ~50% of max profit",
  DTE_21: "house rule: manage at 21 days to expiry",
  EXTRINSIC_DEPLETED: "little time value left to collect",
  DELTA_DEFENSE: "delta rising — defend before it runs ITM",
  TAX_PREFER_ASSIGN: "assignment is the tax-preferred exit here",
  BELOW_TARGET: "premium is below the ~2%/mo house target",
  STRIKE_BELOW_BASIS: "no strike clears your cost basis",
  ASSIGNMENT_RISK_CEILING: "every safe strike exceeds the assignment-risk ceiling",
  NO_LIQUID_STRIKE: "no liquid strike at a worthwhile premium",
  NONE: "",
};

export function isOpenState(state: string): boolean {
  return state.startsWith("OPEN_");
}
