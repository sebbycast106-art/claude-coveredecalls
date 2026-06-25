# Premia — Design & Decision Record

This is the durable record of *why* the app looks and behaves as it does. It
captures the research, the sourced decision rules, the truthfulness guardrails the
build honored, and the multi-agent process that produced it. Read this before
making non-trivial changes.

> **Visual overhaul (2026-06-25) — CURRENT direction is the "light research note."**
> Sections 2–3 below describe the *original* dark "trading-terminal" build. The app
> was then re-skinned (a second 7-agent research + critique workflow) to a **light,
> navy-anchored, Big-4 / consulting-grade "published research note"** — the look an
> IB/HF recruiter benchmarks against a JPM *Guide to the Markets* or a McKinsey
> exhibit. What changed, and is now LIVE:
> - **Light** warm-white canvas (`#FAFAF8`), ONE navy anchor (`#00337C`) + ONE
>   burnt-orange risk tone (`#B3471B`) + a cool-grey ramp. The 5-hue action palette
>   (enter/hold/roll/exit/neutral) collapsed to three families: navy = enter/act,
>   orange = roll/close/risk, grey = hold/neutral. Redundant word+glyph encoding is
>   kept, so zero colorblind-safety loss. Tokens in `globals.css @theme`.
> - **Editorial serif** (Newsreader, via `next/font`) on the masthead, section +
>   action titles, and the hero number; Inter for all data; Roboto Mono demoted to
>   scan-table numeric cells + OCC symbols only. Headings are **assertions**
>   ("Covered calls trailed buy-and-hold by 2.4 pts"), not topics.
> - **Charts replace prose**: yield-vs-2%-target bullets, assignment-risk bars,
>   ranked benchmark bars, a covered/uncovered split, the restyled payoff curve
>   (`src/components/charts.tsx`). The per-card rationale/reason/house-rule
>   triple-stack moved into the card's progressive-disclosure expand.
> - **Disclosure with restraint**: deleted the blocking disclaimer modal + the
>   STALE/indicative/generated/polling chrome + pulse/shimmer motion. The truthful
>   minimum now lives in one masthead line (`As of {date} · modeled, delayed
>   quotes`), per-exhibit source lines, a one-line footer, and the full
>   **Methodology & Disclosures appendix** at `/disclosures`. All quant rigor
>   (QCC/tax/assignment-probability/foregone-upside/payoff) is PRESERVED behind the
>   expand — tiered, never deleted, because that depth is the actual differentiator.

---

## 1. How this was built (the process)

Produced by a deliberately parallel, adversarially-checked process:

1. **An 8-agent research + audit workflow** (run in parallel) covering five lenses
   plus two audits, synthesized into one build spec:
   - *Broker UI patterns* — tastytrade, thinkorswim, Fidelity ATP, IBKR, Robinhood,
     Public: how a covered-call position and an open/close/roll decision are shown.
   - *Management decision rules* — the lifecycle rules (enter / hold / roll / close /
     let-assign), sourced to primary/credible options-education material.
   - *Design system* — an institutional dark "trading-terminal" token set, CVD-safe.
   - *Income-product presentation* — how options-income tools/newsletters (Option
     Alpha, OptionStrat, JEPI/QYLD fact sheets) present income honestly.
   - *Distribution & privacy* — password-gate + demo-mode + disclaimer patterns.
   - *Audit A — payload gaps*: what the old contract couldn't express and what to add.
   - *Audit B — adversarial rule verification*: independently re-sourcing every
     numeric threshold before it was hard-coded into a money engine.
2. **A schema-v2 contract** (`src/lib/contract.ts`) was frozen as the source of truth.
3. **A parallel engine-extension agent** extended the Python engine to emit v2 +
   open-call (hold/roll/close) awareness, TDD, against that exact contract
   (177 tests pass).
4. The UI was built against the contract + a fabricated demo dataset, verified in a
   live browser preview across desktop/mobile and both data paths (owner + demo).

---

## 2. Brand & visual direction

- **Brand:** *Premia* — "Covered-call income, engineered." "Premia" is the
  institutional term for option/risk premia — exactly what a covered-call income
  program harvests — so it reads as a real product, not hype. The name lives **only**
  in `src/lib/brand.ts` — rename in one place.
- **Direction:** *Pro trading-terminal dark.* Depth from layered backgrounds +
  hairline borders, not shadow/glow. Dense, right-aligned tabular numerics. Reads as
  a tool a quant built (the "finance peer" audience), not a consumer roboadvisor.

### Tokens (in `globals.css` `@theme`)

Backgrounds `#0D1117 / #0A0E14 / #141A23 / #1B2330`; borders `#232C3A / #313C4D`;
text `#ECEFF4 / #A4AEBF / #6B7689`; accent `#4D8DF0`. Action colors on the
**blue↔orange axis** (CVD-safe), never red/green as the primary signal:
ENTER `#3B82F6` (blue) · HOLD/LET_ASSIGN `#D9A33A` (amber) · ROLL `#A78BE6` (violet)
· CLOSE `#F0703A` (orange) · STAND_ASIDE `#7C8AA0` (slate). Color is **always**
paired with a word + glyph.

### Type

Inter (UI) + Roboto Mono (dense positions table + contract symbols only). For
card/stat numbers, *Inter with `tabular-nums` + slashed-zero*, not mono — mono is
reserved for the scan table and OCC symbols. Weights 400/500/600 only; headlines
600 not 700 ("institutional tools whisper").

---

## 3. The action taxonomy & its sourced rules

Every threshold is a **configurable house rule**, not a law. Status of each
(confirmed = corroborated by ≥2 credible sources during the adversarial pass):

| Rule | Status | Source(s) |
|---|---|---|
| Entry ~30 delta, 30–45 DTE (range 0.20–0.35) | CONFIRMED (style/configurable) | tastytrade Covered Call; ApexVol; QuantWheel; VolatilityBox |
| Delta ≈ P(ITM) — rule of thumb; breaks near ATM / long-dated | CONFIRMED (caveated) | Macroption; Schwab. *Gate on the prob model, not raw delta.* |
| Manage winners ~50% of max profit + 21-DTE rule | CONFIRMED (default, not law) | tastytrade (50% is the literal order-ticket default); OptionsPilot |
| Roll when little/no extrinsic, prefer net credit; ex-div spikes early-assignment risk | CONFIRMED | tastytrade; Schwab "Covered Calls: Beyond the Basics" |
| Don't roll the strike below breakeven | CONFIRMED | tastytrade |
| OTM/ATM QCC keeps LT holding period; ITM QCC suspends it; proceeds = strike + premium | CONFIRMED (hard tax law) | Fidelity; IRC §1092(c)/(f); 26 CFR §1.1092(c)-1; Achievable Series 9 |

**Do NOT** cite specific numbers as authority-blessed (Fidelity explicitly declines
numeric roll rules) and **do NOT** cite the unverified "200k-trade 15–20%" or
"Cboe 3–5× gamma" backtest figures anywhere.

---

## 4. Truthfulness guardrails the build honors (from the audit)

These are the load-bearing honesty constraints. Don't regress them.

- **`after_tax_ev` was a lie → renamed `after_tax_score`.** It's a tax-adjusted
  *ranking* score (can be negative), not bankable dollars. The UI shows it only as a
  labeled "engine rank score," never as `$` profit.
- **Premium is shown with its counterweight.** `foregone_upside_total` (upside
  surrendered above the strike) is available wherever premium/yield appears. For a
  low-basis holder the honest after-tax edge is often ≈ breakeven — the UI must be
  able to say so, not just show green premium.
- **Prices are modeled & delayed.** `prices_are_modeled` + `data_delay_minutes`
  drive a persistent "indicative · ~15-min delayed · not executable quotes" badge.
  No number is shown as live/fillable. Re-check the live bid before trading.
- **Analyze-only is structural.** No button or copy implies order placement. Verbs
  describe what the **owner** does at the broker, never what the app does.
- **No fabricated performance.** When there's no realized history, the UI renders
  "No realized history yet" / "benchmark pending" / "—" — never a `$0` styled as a
  result. Buy-and-hold is shown even when it beats the overlay (it usually does for
  a parabolic underlying — that's the trade-off, shown plainly).
- **Short-term & ITM-QCC tax exposure are surfaced as badges**, never buried in
  prose.
- **The ingest validates the payload** (`zod` in `/api/push`) so a malformed push
  can't render a misleading EXIT/HOLD.

---

## 5. Schema v2 — what changed from v1

Added to the per-recommendation contract: widened `action` enum
(`ENTER|HOLD|ROLL|CLOSE|LET_ASSIGN|STAND_ASIDE|NO_TRADE`), `position_state`,
`urgency`, `headline` (rendered verbatim), `action_trigger`, `open_call{}` (the
missing capability — present iff a short call is open), `roll_target{}`,
`ex_div_before_expiry`, `earnings_before_expiry`, plus the previously-dropped
`spot`, `prior_close`, `foregone_upside_total`, `backing_lots`, and the renamed
`after_tax_score`. Added top-level `schema_version`, `data_delay_minutes`,
`prices_are_modeled`, a `portfolio{}` rollup, and an extended `performance{}` with a
realized-premium ledger + benchmark window. Full shape in `src/lib/contract.ts`.

---

## 6. Decisions made on the open questions (defaults; change if you disagree)

- **Open-call entry data** → manual `open_calls.csv` in the bot (mirrors
  `positions.csv`); current marks are BSM-modeled (consistent with
  `prices_are_modeled`). The real book has **no open calls today**, so HOLD/ROLL/
  CLOSE/LET_ASSIGN are exercised by the demo dataset until you add open positions.
- **Realized ledger** → starts fresh (engine emits `[]` / null until close events).
  The app's `run_history` table accumulates pushes so history survives the bot's
  ephemeral runner.
- **Demo deployment** → one deployment, two passwords (owner + demo roles),
  server-enforced. A fully separate `APP_MODE=demo` deploy is strictly safer for a
  widely-shared link if you ever want it.
- **after_tax_score** → shown as a labeled engine-rank in detail/table, never as `$`.
- **Roll cap** → surfaced, not auto-enforced (the engine reports; the owner decides).
- **ex-div / earnings flags** → the engine currently emits `false` (no ex-div /
  earnings calendar in the codebase) — a known TODO; the demo shows the badges.
