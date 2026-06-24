import { ActionBadge, Eyebrow, Pill, RiskPill } from "@/components/ui";
import { ACTION_META } from "@/lib/actions";
import type { Recommendation } from "@/lib/contract";
import { contractLabel, fmtMoney, fmtMoneySigned, fmtNum, fmtPct1, parseOcc } from "@/lib/format";
import { cn } from "@/lib/utils";

const TONE_VAR: Record<string, string> = {
  enter: "var(--color-enter)",
  hold: "var(--color-hold)",
  roll: "var(--color-roll)",
  exit: "var(--color-exit)",
  neutral: "var(--color-neutral)",
};

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th className={cn("px-3 py-2.5 whitespace-nowrap", right ? "text-right" : "text-left")}>
      <Eyebrow>{children}</Eyebrow>
    </th>
  );
}

export function ScanTable({ recs }: { recs: Recommendation[] }) {
  return (
    <div className="rounded-xl border border-line bg-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-line">
              <Th>Ticker</Th>
              <Th>Action</Th>
              <Th>Contract</Th>
              <Th right>Strike</Th>
              <Th right>DTE</Th>
              <Th right>Δ</Th>
              <Th right>P(assign)</Th>
              <Th right>Net Prem</Th>
              <Th right>Mo. Yield</Th>
              <Th right>Rank</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {recs.map((r) => {
              const oc = r.open_call;
              const tone = ACTION_META[r.action].tone;
              const strike = oc?.open_strike ?? r.strike;
              const dte = oc?.open_dte ?? r.dte;
              const delta = oc?.current_delta ?? r.delta;
              const passign = oc?.assignment_prob_now ?? r.prob_assignment_rw;
              const sym = oc?.open_contract_symbol ?? r.contract_symbol;
              const human = parseOcc(sym)?.human ?? contractLabel(r.ticker, strike, r.expiry);
              return (
                <tr key={r.ticker} className="hover:bg-sunken/60 transition-colors">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-[2px] h-4 rounded-full shrink-0"
                        style={{ backgroundColor: TONE_VAR[tone] }}
                      />
                      <span className="font-mono font-semibold text-ink">{r.ticker}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <ActionBadge action={r.action} size="sm" />
                  </td>
                  <td className="px-3 py-2.5 text-faint font-mono text-[11.5px] whitespace-nowrap">
                    {strike != null ? human : "—"}
                    {r.below_target && r.action === "ENTER" && (
                      <Pill className="ml-2 border-hold/30 bg-hold/10 text-hold-on">↓2%</Pill>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tnum text-muted">
                    {fmtMoney(strike, 0)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tnum text-muted">
                    {dte != null ? `${dte}d` : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tnum text-muted">
                    {fmtNum(delta)}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <RiskPill p={passign} />
                  </td>
                  <td
                    className={cn(
                      "px-3 py-2.5 text-right font-mono tnum font-semibold",
                      r.net_premium_per_share != null ? "text-enter-on" : "text-faint"
                    )}
                  >
                    {r.net_premium_per_share != null
                      ? fmtMoneySigned(r.net_premium_per_share, 2)
                      : "—"}
                  </td>
                  <td
                    className={cn(
                      "px-3 py-2.5 text-right font-mono tnum",
                      r.below_target ? "text-hold-on" : "text-muted"
                    )}
                  >
                    {fmtPct1(r.monthly_yield)}
                  </td>
                  <td
                    className="px-3 py-2.5 text-right font-mono tnum text-faint"
                    title="Tax-adjusted ranking score — not dollars of profit"
                  >
                    {r.after_tax_score != null ? fmtNum(r.after_tax_score, 0) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="border-t border-line px-3 py-2 text-[10.5px] text-faint">
        Open positions show their <span className="text-muted">current</span> contract; flat tickers
        show the <span className="text-muted">candidate</span> write. &quot;Rank&quot; is a
        tax-adjusted ordering score, not dollars.
      </div>
    </div>
  );
}
