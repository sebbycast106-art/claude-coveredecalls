import { RankedBars } from "@/components/charts";
import { Card, Eyebrow, Pill, SectionTitle, SourceLine } from "@/components/ui";
import type { Performance } from "@/lib/contract";
import { fmtDateLong, fmtMoney0, fmtMoneySigned } from "@/lib/format";
import { cn } from "@/lib/utils";

const EVENT_LABEL: Record<string, string> = {
  EXPIRED: "expired",
  BOUGHT_TO_CLOSE: "closed",
  ASSIGNED: "assigned",
  ROLLED: "rolled",
};

function assertion(cc: number | null, bh: number | null): string {
  if (cc == null || bh == null) return "Performance vs benchmarks";
  const pts = Math.abs((cc - bh) * 100).toFixed(1);
  return cc >= bh
    ? `Covered calls added ${pts} pts over buy-and-hold this window`
    : `Covered calls trailed buy-and-hold by ${pts} pts — the income trade-off`;
}

export function PerformancePanel({ performance }: { performance: Performance }) {
  const { spy_return, buyhold_return, covered_call_total_return, benchmark_window_start } =
    performance;
  const ledger = performance.realized_premium_ledger ?? [];
  const hasBench =
    covered_call_total_return != null || buyhold_return != null || spy_return != null;

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card className="p-5">
        <SectionTitle as="h3" className="text-[17px]">
          {assertion(covered_call_total_return, buyhold_return)}
        </SectionTitle>
        {hasBench ? (
          <>
            <div className="mt-5">
              <RankedBars
                rows={[
                  { label: "Covered call", value: covered_call_total_return, accent: true },
                  { label: "Buy & hold", value: buyhold_return },
                  { label: "SPY total", value: spy_return },
                ]}
              />
            </div>
            <SourceLine className="mt-4">
              Total return = stock P/L + realized premium, net of tax. Source: modeled, delayed
              quotes
              {benchmark_window_start ? ` · since ${fmtDateLong(benchmark_window_start)}` : ""}.
            </SourceLine>
          </>
        ) : (
          <p className="mt-4 text-[13px] text-muted">No benchmark history yet for this window.</p>
        )}
      </Card>

      <Card className="p-5">
        <div className="flex items-baseline justify-between">
          <Eyebrow>Realized premium ledger</Eyebrow>
          <span className="text-[17px] font-semibold tnum text-ink">
            {fmtMoney0(performance.premium_collected_to_date)}
          </span>
        </div>
        {ledger.length === 0 ? (
          <p className="mt-4 text-[13px] text-muted">
            No realized history yet — this fills as calls expire, close, assign, or roll.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-line max-h-[180px] overflow-y-auto">
            {ledger
              .slice()
              .reverse()
              .map((e) => (
                <li
                  key={`${e.event_date}-${e.contract_symbol}`}
                  className="flex items-center justify-between gap-3 py-1.5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-ink text-[12px] w-12 shrink-0">
                      {e.ticker}
                    </span>
                    <Pill className="border-line bg-sunken text-muted shrink-0">
                      {EVENT_LABEL[e.event_type] ?? e.event_type}
                    </Pill>
                    <span className="text-[10.5px] text-faint tnum shrink-0">
                      {fmtDateLong(e.event_date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-faint uppercase">{e.tax_character}</span>
                    <span
                      className={cn(
                        "text-[12.5px] tnum font-semibold",
                        e.realized_pl >= 0 ? "text-pos" : "text-neg"
                      )}
                    >
                      {fmtMoneySigned(e.realized_pl, 0)}
                    </span>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
