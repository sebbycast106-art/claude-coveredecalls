import { CoveredBar } from "@/components/charts";
import { Eyebrow } from "@/components/ui";
import type { Performance, Portfolio } from "@/lib/contract";
import { fmtMoney0, fmtPctSigned } from "@/lib/format";

// "State of the book" — one warm sentence, never a row of dashed zero-tiles.
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

  const pct = portfolio ? Math.round(portfolio.pct_book_covered * 100) : 0;
  const covered = portfolio?.covered_shares ?? 0;
  const total = portfolio?.total_shares ?? 0;
  const open = portfolio?.open_call_count ?? 0;

  return (
    <div className="rounded-xl border border-line bg-surface exhibit px-6 py-5">
      <Eyebrow>State of the book</Eyebrow>
      <p className="mt-2 font-serif font-normal text-[20px] text-ink leading-snug tracking-[-0.01em]">
        {portfolio ? (
          <>
            Your book is <span className="tnum">{pct}%</span> covered —{" "}
            <span className="tnum">{covered.toLocaleString()}</span> of{" "}
            <span className="tnum">{total.toLocaleString()}</span> shares working
            {open > 0 ? (
              <>
                {" "}
                · <span className="tnum">{open}</span> {open === 1 ? "call" : "calls"} open
              </>
            ) : (
              <> · no calls open right now</>
            )}
            .
          </>
        ) : (
          "Your positions load once the engine publishes."
        )}
      </p>
      {portfolio && total > 0 && (
        <div className="mt-3 max-w-md">
          <CoveredBar covered={covered} total={total} />
        </div>
      )}
      <p className="mt-3 text-[13.5px] text-muted leading-relaxed">
        {hasRealized
          ? `${fmtMoney0(realized)} in premium banked so far this cycle.`
          : "No premium banked yet this cycle — that's expected on the quiet stretches."}
        {cc != null && bh != null
          ? ` Covered-call ${fmtPctSigned(cc)} vs. simply holding ${fmtPctSigned(bh)}.`
          : " The vs-holding benchmark fills in as real history accrues."}
      </p>
    </div>
  );
}
