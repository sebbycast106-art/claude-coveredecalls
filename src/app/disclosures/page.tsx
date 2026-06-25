import Link from "next/link";
import { BRAND } from "@/lib/brand";

const METHODOLOGY: { k: string; v: string }[] = [
  {
    k: "Pricing",
    v: "Premiums and marks are Black-Scholes estimates computed from free, ~15-minute-delayed option chains — modeled, not executable quotes. Re-check the live bid before placing any order.",
  },
  {
    k: "Selection",
    v: "Among strikes that clear each lot's cost basis and stay under the assignment-risk ceiling, the engine maximizes net premium income — the highest strike whose premium still meets the ~2%/mo house target. Entry conventions sit near ~30-delta / 30–45 DTE.",
  },
  {
    k: "Tax",
    v: "Figures are net of tax under the holder's profile. Qualified-covered-call status preserves the long-term holding period; an in-the-money QCC suspends it. The 'engine rank score' is a tax-adjusted ordering metric, not dollars of profit. After-tax figures are estimates, not tax advice.",
  },
  {
    k: "Management rules",
    v: "Take the win near ~50% of max profit; manage at ~21 days to expiry; roll for a net credit and never below breakeven; let low-basis long-term calls assign when that is the tax-smart exit. These are house rules and configurable defaults — conventions, not authority-blessed laws.",
  },
  {
    k: "Hard rules",
    v: "Never write a strike below a lot's basis; long-term lots first; cap real-world assignment probability; stand down (no trade) when data looks stale. The engine recommends only — it never places a trade.",
  },
  {
    k: "Benchmarks",
    v: "Covered-call total return is stock P/L plus realized premium, net of tax — the apples-to-apples line against buy-and-hold and SPY total return. When buy-and-hold is higher, that is the income strategy's trade-off, shown plainly. Performance is never fabricated: with no realized history, figures read '—', not zero.",
  },
];

const DISCLAIMERS = [
  "For informational and illustrative purposes only. Not investment advice, not a recommendation to buy or sell any security, and not an offer or solicitation.",
  "Analyze-only: this tool does not place trades, connect to any brokerage, or move money. All figures are model outputs; the user independently makes and executes any decisions.",
  "A personal project built for the author's own use. No advisory, fiduciary, or client relationship is created by viewing it.",
  "Prices and option data are modeled and may be delayed (~15 min). Figures are estimates, including after-tax calculations, which depend on assumptions that may not match your situation.",
  "Provided as-is, without warranty. Past performance does not indicate future results.",
  "Tax treatment shown is illustrative and not tax advice; consult a professional.",
  "An independent personal project. Not affiliated with, endorsed by, or representing any employer or firm.",
];

export default function DisclosuresPage() {
  return (
    <main className="mx-auto max-w-[760px] px-6 py-14">
      <Link href="/" className="text-[12px] text-muted hover:text-accent">
        ← Back to analysis
      </Link>
      <h1 className="mt-6 font-serif text-3xl text-ink tracking-[-0.01em]">
        Methodology &amp; Disclosures
      </h1>
      <p className="mt-2 text-sm text-muted">
        {BRAND.name} — how the figures are produced, and the fine print.
      </p>

      <section className="mt-10">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-faint">
          Methodology
        </h2>
        <dl className="mt-4 divide-y divide-line">
          {METHODOLOGY.map((r) => (
            <div key={r.k} className="grid sm:grid-cols-[140px_1fr] gap-1 sm:gap-5 py-4">
              <dt className="font-serif text-[15px] text-ink">{r.k}</dt>
              <dd className="text-[13px] text-muted leading-relaxed">{r.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-12">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-faint">
          Disclosures
        </h2>
        <ol className="mt-4 space-y-4">
          {DISCLAIMERS.map((d, i) => (
            <li key={d} className="flex gap-4">
              <span className="text-faint text-sm tnum shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-[13px] leading-relaxed text-muted">{d}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
