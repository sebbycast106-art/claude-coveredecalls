import { Card, Eyebrow } from "@/components/ui";
import type { CoveredCallsPayload } from "@/lib/contract";
import { fmtPct1 } from "@/lib/format";

// Credibility through transparency: how the numbers are produced + the honest
// caveats. The 50% / 21-DTE / delta triggers are named as house rules, never
// attributed to an authority.
export function Methodology({ data }: { data: CoveredCallsPayload }) {
  const rows: { k: string; v: string }[] = [
    {
      k: "Pricing",
      v: "Black-Scholes on free, ~15-min-delayed option chains. Premiums and marks are modeled estimates, not executable quotes — re-check the live bid before trading.",
    },
    {
      k: "Selection",
      v: "Among strikes that clear each lot's cost basis and stay under the assignment-risk ceiling, the engine maximizes net premium income — the highest strike whose premium still meets the ~2%/mo house target.",
    },
    {
      k: "Tax",
      v: "Figures are net of tax under the holder's profile. Qualified-covered-call status preserves the long-term holding period; an in-the-money QCC suspends it. After-tax figures are estimates, not tax advice.",
    },
    {
      k: "Manage rules",
      v: "Take the win near ~50% of max profit; manage at ~21 days to expiry; roll for a net credit and never below breakeven; let low-basis long-term calls assign when that's the tax-smart exit. These are house rules and configurable defaults — conventions, not authority-blessed laws.",
    },
    {
      k: "Hard rules",
      v: "Never write a strike below a lot's basis; long-term lots first; cap real-world assignment probability; stand down (no trade) when data looks stale. The engine recommends only — it never places a trade.",
    },
  ];

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <Eyebrow>How this is calculated</Eyebrow>
        {data.risk_free != null && (
          <span className="text-[10.5px] text-faint font-mono">
            risk-free {fmtPct1(data.risk_free)}
          </span>
        )}
      </div>
      <dl className="mt-4 space-y-3">
        {rows.map((r) => (
          <div key={r.k} className="grid sm:grid-cols-[120px_1fr] gap-1 sm:gap-4">
            <dt className="text-[12px] font-semibold text-muted">{r.k}</dt>
            <dd className="text-[12.5px] text-faint leading-relaxed">{r.v}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
