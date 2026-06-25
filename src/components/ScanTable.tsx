import { ActionBadge, Eyebrow, Pill, RiskPill } from "@/components/ui";
import { ACTION_META, TONE_VAR } from "@/lib/actions";
import type { Recommendation } from "@/lib/contract";
import { contractLabel, fmtMoney, fmtMoneySigned, fmtNum, fmtPct1, parseOcc } from "@/lib/format";
import { cn } from "@/lib/utils";

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th className={cn("px-3 py-2.5 whitespace-nowrap", right ? "text-right" : "text-left")}>
      <Eyebrow>{children}</Eyebrow>
    </th>
  );
}

export function ScanTable({ recs }: { recs: Recommendation[] }) {
  return (
    <div className="rounded-lg border border-line bg-surface exhibit overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-line-strong">
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
          <tbody className="divide-y divide-line">
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
                <tr key={r.ticker} className="hover:bg-sunken transition-colors">
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
                  <td className="px-3 py-2.5 text-muted font-mono text-[11.5px] whitespace-nowrap">
                    {strike != null ? human : "—"}
                    {r.below_target && r.action === "ENTER" && (
                      <Pill className="ml-2 border-risk/25 bg-risk-soft text-risk">↓2%</Pill>
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
                      r.net_premium_per_share != null ? "text-ink" : "text-faint"
                    )}
                  >
                    {r.net_premium_per_share != null
                      ? fmtMoneySigned(r.net_premium_per_share, 2)
                      : "—"}
                  </td>
                  <td
                    className={cn(
                      "px-3 py-2.5 text-right font-mono tnum font-semibold",
                      r.below_target ? "text-risk" : "text-accent"
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
      <div className="border-t border-line px-3 py-2">
        <p className="text-[10.5px] text-faint">
          Open positions show the current contract; flat tickers show the candidate write. Source:
          modeled, delayed quotes.
        </p>
      </div>
    </div>
  );
}
