import { Card, Eyebrow, Pill } from "@/components/ui";
import type { Performance } from "@/lib/contract";
import { fmtDateYear, fmtMoney0, fmtMoneySigned, fmtPctSigned } from "@/lib/format";
import { cn } from "@/lib/utils";

function BenchBar({
  label,
  value,
  max,
  color,
  emphasize,
}: {
  label: string;
  value: number | null;
  max: number;
  color: string;
  emphasize?: boolean;
}) {
  const w = value != null && max > 0 ? Math.min(1, Math.abs(value) / max) : 0;
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "w-28 shrink-0 text-[12px]",
          emphasize ? "text-ink font-medium" : "text-muted"
        )}
      >
        {label}
      </span>
      <div className="flex-1 h-2 rounded-full bg-sunken overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${w * 100}%`, backgroundColor: color }}
        />
      </div>
      <span
        className={cn(
          "w-16 text-right text-[13px] tnum",
          value != null && value >= 0 ? "text-up" : "text-down"
        )}
      >
        {value != null ? fmtPctSigned(value) : "—"}
      </span>
    </div>
  );
}

const EVENT_LABEL: Record<string, string> = {
  EXPIRED: "expired",
  BOUGHT_TO_CLOSE: "closed",
  ASSIGNED: "assigned",
  ROLLED: "rolled",
};

export function PerformancePanel({ performance }: { performance: Performance }) {
  const { spy_return, buyhold_return, covered_call_total_return, benchmark_window_start } =
    performance;
  const ledger = performance.realized_premium_ledger ?? [];
  const hasBench =
    covered_call_total_return != null || buyhold_return != null || spy_return != null;
  const max = Math.max(
    Math.abs(covered_call_total_return ?? 0),
    Math.abs(buyhold_return ?? 0),
    Math.abs(spy_return ?? 0),
    0.01
  );

  return (
    <div className="grid lg:grid-cols-2 gap-3">
      {/* Benchmark */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Eyebrow>Total return vs benchmarks</Eyebrow>
          {benchmark_window_start && (
            <span className="text-[10.5px] text-faint font-mono">
              since {fmtDateYear(benchmark_window_start)}
            </span>
          )}
        </div>
        {hasBench ? (
          <div className="mt-4 space-y-3">
            <BenchBar
              label="Covered-call"
              value={covered_call_total_return}
              max={max}
              color="var(--color-accent)"
              emphasize
            />
            <BenchBar
              label="Buy & hold"
              value={buyhold_return}
              max={max}
              color="var(--color-roll)"
            />
            <BenchBar
              label="SPY (total)"
              value={spy_return}
              max={max}
              color="var(--color-neutral)"
            />
            <p className="pt-1 text-[11px] text-faint leading-relaxed">
              Covered-call return is stock P/L plus realized premium, net of tax — the
              apples-to-apples line. When buy-and-hold is higher, that&apos;s the trade-off the
              income strategy makes, shown plainly.
            </p>
          </div>
        ) : (
          <p className="mt-4 text-[13px] text-muted">No benchmark history yet for this window.</p>
        )}
      </Card>

      {/* Realized ledger */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Eyebrow>Realized premium ledger</Eyebrow>
          <span className="text-[13px] font-semibold tnum text-ink">
            {fmtMoney0(performance.premium_collected_to_date)}
          </span>
        </div>
        {ledger.length === 0 ? (
          <p className="mt-4 text-[13px] text-muted">
            No realized history yet — this fills as calls expire, close, assign, or roll.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-line/60 max-h-[180px] overflow-y-auto">
            {ledger
              .slice()
              .reverse()
              .map((e) => (
                <li
                  key={`${e.event_date}-${e.contract_symbol}`}
                  className="flex items-center justify-between gap-3 py-1.5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono font-semibold text-ink text-[12px] w-12 shrink-0">
                      {e.ticker}
                    </span>
                    <Pill className="border-line bg-sunken text-faint shrink-0">
                      {EVENT_LABEL[e.event_type] ?? e.event_type}
                    </Pill>
                    <span className="text-[10.5px] text-faint font-mono shrink-0">
                      {fmtDateYear(e.event_date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-faint uppercase">{e.tax_character}</span>
                    <span
                      className={cn(
                        "text-[12.5px] tnum font-semibold",
                        e.realized_pl >= 0 ? "text-up" : "text-down"
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
