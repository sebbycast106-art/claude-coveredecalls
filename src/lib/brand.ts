// ── Brand / product identity ────────────────────────────────────────────────
// Everything user-facing about the product name lives here. Rename in one place;
// every surface imports from this constant. Do not hard-code the name elsewhere.

export const BRAND = {
  name: "Premia",
  // "Premia" — the institutional term for option/risk premia, which is exactly
  // what a covered-call income program harvests. Reads as a real product, not hype.
  tagline: "Covered-call income, engineered.",
  // Short label used in tight spaces (nav, favicon alt, login).
  short: "Premia",
} as const;
