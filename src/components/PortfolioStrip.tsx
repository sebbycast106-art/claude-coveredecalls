import { CoveredBar } from "@/components/charts";
import { Eyebrow } from "@/components/ui";
import type { Performance, Portfolio } from "@/lib/contract";
import { fmtMoney0, fmtPct0, fmtPctSigned } from "@/lib/format";
import { cn } from "@/lib/utils";

function Tile({
  label,
  value,
  sub,
  lead,
  muted,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  lead?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex gap-3 px-5 py-4">
      <div
        className={cn(
          "w-[2px] shrink-0 self-stretch rounded-full",
          lead ? "bg-accent" : "bg-transparent"
        )}
      />
      <div className="flex-1 min-w-0">
        <Eyebrow>{label}</Eyebrow>
        <div
          className={cn(
            "mt-2 text-[22px] leading-none font-semibold tnum",
            muted ? "text-faint" : "text-ink"
          )}
        >
          {value}
        </div>
        {sub && <div className="mt-2 text-[11.5px] text-faint">{sub}</div>}
      </div>
    </div>
  );
}

export function PortfolioStrip({
  portfolio,
  performance,
}: {
  portfolio: Portfolio | null;
  performance: Performance;
}) {
  const realized =
    portfolio?.realized_premium_to_date ?? performance.premium_collected_to_date ?? 0;
  const hasRealized = realized > 0;
  const cc = performance.covered_call_total_return;
  const bh = performance.buyhold_return;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 rounded-lg border border-line bg-surface exhibit divide-y sm:divide-y-0 sm:divide-x divide-line">
      <Tile
        lead
        label="Premium Collected"
        value={hasRealized ? fmtMoney0(realized) : "—"}
        sub={hasRealized ? "realized to date, net of buybacks" : "No realized history yet"}
        muted={!hasRealized}
      />
      <Tile
        label="Book Covered"
        value={portfolio ? fmtPct0(portfolio.pct_book_covered) : "—"}
        sub={
          portfolio ? (
            <div className="space-y-1.5">
              <CoveredBar covered={portfolio.covered_shares} total={portfolio.total_shares} />
              <span className="tnum">
                {portfolio.covered_shares.toLocaleString()} /{" "}
                {portfolio.total_shares.toLocaleString()} sh · {portfolio.open_call_count} open
              </span>
            </div>
          ) : undefined
        }
      />
      <Tile
        label="Return vs Buy & Hold"
        value={cc != null ? fmtPctSigned(cc) : "—"}
        muted={cc == null}
        sub={
          bh != null ? (
            <span className="tnum">
              buy &amp; hold {fmtPctSigned(bh)}
              {cc != null && (
                <span className={cn("ml-1.5", cc - bh >= 0 ? "text-pos" : "text-neg")}>
                  ({cc - bh >= 0 ? "+" : "−"}
                  {Math.abs((cc - bh) * 100).toFixed(1)} pts)
                </span>
              )}
            </span>
          ) : (
            "benchmark pending"
          )
        }
      />
    </div>
  );
}
