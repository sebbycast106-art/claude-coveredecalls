# Theta Desk — Covered-Call Decision Desk

A standalone, password-gated, **distributable** web app that presents the monthly
covered-call recommendations from the [covered-call engine](../covered-call-bot)
as clear **buy / sell / hold** decisions. Built to look like an institutional
fintech product so it doubles as a portfolio piece you can send to someone with a
password — without exposing your real positions (see **Demo mode**).

> **Analyze-only.** This app never places a trade, connects to a brokerage, or
> moves money. It renders model output; you decide and execute. Not investment
> advice. Full disclaimers at `/disclosures`.

This app was **extracted out of** the personal Mission Control dashboard so it can
be distributed on its own, with none of the other personal projects' code.

---

## The core idea: answer three questions, per position

The whole UI is organized around one question the owner kept asking: *for this
underlying, am I in a call — and should I get in, stay in, or get out?* Every
position renders an unmissable **action** with a color (colorblind-safe; blue↔orange
axis, never red/green as the primary signal) and the plain-English thing the owner
does at their broker:

| Action | Verb | When | Color |
|---|---|---|---|
| **ENTER** | Sell to Open | Flat; a worthwhile call to write | blue |
| **HOLD** | Hold | In a call, keep it (<50% profit, >21 DTE) | amber |
| **ROLL** | Roll | In a call; buy-to-close + sell a later/higher one for a net credit | violet |
| **CLOSE** | Buy to Close | In a call; take the win (~50% max profit) or "all risk, no reward" | orange |
| **LET_ASSIGN** | Let Assign | In a call; assignment is the tax-smart exit (low-basis LT lot) | amber + tax badge |
| **STAND_ASIDE** | No Trade | Flat; nothing worth writing | slate |

The numeric thresholds (50% profit, 21 DTE, ~30-delta / 30–45-DTE entry) are
**house rules / configurable defaults** — conventions corroborated across
tastytrade / Schwab / Fidelity, *not* authority-blessed laws. The UI labels them
as house rules and never attributes a specific number to a named authority. See
[`docs/DESIGN.md`](docs/DESIGN.md) for sources.

---

## Architecture

```
covered-call-bot (Python)                covered-calls-app (this, Next.js)
  run.py / GH Actions cron                  /api/push   ← secret-gated ingest (+ schema validation)
  builds schema-v2 payload  ──POST──▶         │           stores latest + appends run_history ledger
  {bot, data, secret}                         ▼
                                            SQLite (Railway volume)
                                              │
  viewer ──login (owner|demo)──▶ JWT cookie ──▶ /api/covered-calls
                                              owner → real pushed data
                                              demo  → fabricated demo.ts (real $ never sent)
```

- **Next.js 16** (App Router) · **Tailwind v4** · **Drizzle + better-sqlite3** ·
  **jose** JWT · **bcryptjs** · **Biome**. Self-hosted Inter + Roboto Mono via
  `next/font` (no third-party font request leaks viewer IPs).
- **The payload contract is `src/lib/contract.ts`** (`SCHEMA_VERSION = 2`) — the
  single source of truth the engine must match. The demo dataset (`src/data/demo.ts`)
  is typed against it so it can't drift.

### Key files

| Path | What |
|---|---|
| `src/lib/contract.ts` | The schema-v2 payload types (engine ↔ UI source of truth) |
| `src/lib/actions.ts` | Action taxonomy: verbs, owner-actions, colors, icons, triggers |
| `src/data/demo.ts` | Fabricated demo dataset exercising every action state |
| `src/app/api/push/route.ts` | Secret-gated ingest; zod-validates; stores latest + run_history |
| `src/app/api/covered-calls/route.ts` | Role-branched read (owner=real, demo=fabricated) |
| `src/app/api/auth/login/route.ts` | Dual-password (owner/demo) login, rate-limited |
| `src/components/DecisionCard.tsx` | The per-position hero card (the product) |
| `src/components/*` | TopBar, PortfolioStrip, ScanTable, PerformancePanel, Methodology, … |

---

## Demo mode (how you share it safely)

Hand out the **demo password**, keep the **owner password** private.

- The login issues a JWT carrying a server-side `role` (`owner` | `demo`).
- `/api/covered-calls` **hard-branches on the role**: a demo JWT loads the
  fabricated `demo.ts`; the real pushed data is *never* serialized to a demo
  viewer's browser (no client-side masking — that would ship real numbers in the
  bundle).
- Demo mode shows a persistent `SAMPLE DATA — illustrative figures, not a live
  account` banner and a frozen `as_of` date.
- `demo.ts` is the only committed dataset and is entirely made up.

---

## Run locally

```bash
npm install
cp .env.example .env.local      # fill in or leave blank for dev
npm run dev                     # http://localhost:3007  (configured port)
npm run typecheck && npm run check
```

In local dev with **no** password hashes set, any password logs you in as
**owner**, except the literal password `demo`, which logs you in as **demo** (to
preview the shared-link experience). Push a sample to the owner view:

```bash
curl -X POST localhost:3007/api/push -H 'Content-Type: application/json' \
  --data '{"bot":"covered_calls","secret":"<SCHEDULER_SECRET>","data":{ ...schema-v2 payload... }}'
```

## Environment variables

| Var | Purpose |
|---|---|
| `JWT_SECRET` | Signs the login cookie (32+ random bytes) |
| `APP_PASSWORD_HASH` | bcrypt hash of the **owner** password |
| `DEMO_PASSWORD_HASH` | bcrypt hash of the **demo** password (omit to disable demo login) |
| `SCHEDULER_SECRET` | Shared secret the engine presents to `/api/push` (must match the bot) |
| `DATABASE_URL` | SQLite file path, e.g. `file:/data/app.db` on a Railway volume |

Generate a hash: `node -e "console.log(require('bcryptjs').hashSync('pw',10))"`.

---

## Deploy (Railway)

Mirrors the dashboard's setup (manual `railway up`, standalone output, mounted
volume so the SQLite DB + run-history survive redeploys):

1. `railway init` (or link) a **new** service — keep it separate from the personal
   dashboard so the distributable link is single-purpose.
2. Add a volume mounted at `/data`; set `DATABASE_URL=file:/data/app.db`.
3. Set env vars: `JWT_SECRET`, `APP_PASSWORD_HASH`, `DEMO_PASSWORD_HASH`,
   `SCHEDULER_SECRET`.
4. `railway up` from this directory. `railway.toml` runs `node server.js`
   (Next standalone).
5. **Repoint the engine:** set the bot's GitHub Actions secret
   `DASHBOARD_PUSH_URL` → `https://<this-service>/api/push` and make the bot's
   `SCHEDULER_SECRET` match this app's. (No bot code change — the URL/secret are env.)

> Railway CLI auth: use an **account token via `RAILWAY_API_TOKEN`**; the stale
> `RAILWAY_TOKEN` baked into the shell profile is unauthorized — `unset` it first.
> In Git Bash, prefix volume commands with `MSYS_NO_PATHCONV=1` so `/data` isn't
> mangled.

---

## Pre-share checklist (run every time before sending the link)

- [ ] You're handing out the **demo** password, not the owner password.
- [ ] `gitleaks detect` clean on working tree **and** full history (`--log-opts=--all`).
- [ ] `.env*` and `*.db` are gitignored; secrets live only in Railway env.
- [ ] `demo.ts` contains only fabricated figures; no real positions anywhere.
- [ ] Disclaimers render (`/disclosures`, footer, first-load modal); `as_of` / stale
      / "indicative ~15-min delayed" badges present.
- [ ] No other-project or PII code in the repo (this is a single-purpose repo).

---

See [`docs/DESIGN.md`](docs/DESIGN.md) for the design system, the action-rule
sources, the audit findings the build honored, and the multi-agent process used to
produce it.
