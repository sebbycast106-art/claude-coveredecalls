import { Eyebrow } from "@/components/ui";
import type { Performance, Portfolio } from "@/lib/contract";
import { fmtMoney0, fmtPct0, fmtPctSigned } from "@/lib/format";
import { cn } from "@/lib/utils";

function Delta({ n, suffix }: { n: number | null; suffix?: string }) {
  if (n == null) return null;
  const up = n >= 0;
  return (
    <span className={cn("tnum", up ? "text-up" : "text-down")}>
      {up ? "▲" : "▼"} {fmtPctSigned(Math.abs(n))}
      {suffix ? ` ${suffix}` : ""}
    </span>
  );
}

function Tile({
  label,
  value,
  sub,
  accent,
  muted,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  accent: string;
  muted?: boolean;
}) {
  return (
    <div className="relative flex overflow-hidden rounded-xl border border-line bg-surface">
      <div className="w-[3px] shrink-0 self-stretch" style={{ backgroundColor: accent }} />
      <div className="flex-1 px-4 py-3.5">
        <Eyebrow>{label}</Eyebrow>
        <div
          className={cn(
            "mt-2 text-[26px] leading-none font-semibold tnum",
            muted ? "text-muted" : "text-ink"
          )}
        >
          {value}
        </div>
        {sub && <div className="mt-2 text-[11.5px] text-faint tnum">{sub}</div>}
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
  const edge = cc != null && bh != null ? cc - bh : null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Tile
        label="Premium Collected"
        value={hasRealized ? fmtMoney0(realized) : "—"}
        sub={hasRealized ? "realized to date, net of buybacks" : "No realized history yet"}
        accent="var(--color-enter)"
        muted={!hasRealized}
      />
      <Tile
        label="Book Covered"
        value={portfolio ? fmtPct0(portfolio.pct_book_covered) : "—"}
        sub={
          portfolio
            ? `${portfolio.covered_shares.toLocaleString()} / ${portfolio.total_shares.toLocaleString()} sh · ${portfolio.open_call_count} open`
            : undefined
        }
        accent="var(--color-accent)"
      />
      <Tile
        label="Expected Monthly Income"
        value={portfolio ? fmtMoney0(portfolio.expected_monthly_income) : "—"}
        sub="modeled, this cycle"
        accent="var(--color-hold)"
      />
      <Tile
        label="Total Return vs Buy & Hold"
        value={cc != null ? fmtPctSigned(cc) : "—"}
        sub={
          bh != null ? (
            <span className="inline-flex items-center gap-2">
              <span>
                buy &amp; hold <span className="font-mono">{fmtPctSigned(bh)}</span>
              </span>
              {edge != null && <Delta n={edge} />}
            </span>
          ) : (
            "benchmark pending"
          )
        }
        accent="var(--color-roll)"
      />
    </div>
  );
}
