"use client";

import { useMemo } from "react";
import { DecisionCard } from "@/components/DecisionCard";
import { DisclaimerGate } from "@/components/DisclaimerGate";
import { Footer } from "@/components/Footer";
import { Methodology } from "@/components/Methodology";
import { PerformancePanel } from "@/components/PerformancePanel";
import { PortfolioStrip } from "@/components/PortfolioStrip";
import { ScanTable } from "@/components/ScanTable";
import { TopBar } from "@/components/TopBar";
import { Eyebrow } from "@/components/ui";
import { useCoveredCalls } from "@/hooks/useCoveredCalls";
import type { CoveredCallsPayload, Recommendation, Urgency } from "@/lib/contract";
import { fmtDateYear } from "@/lib/format";

const URGENCY_RANK: Record<Urgency, number> = { ACT_TODAY: 0, SOON: 1, ROUTINE: 2 };

function isQuiet(r: Recommendation) {
  return r.action === "STAND_ASIDE" || r.action === "NO_TRADE";
}

function SectionHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-3">
      <h2 className="text-[15px] font-semibold text-ink tracking-tight">{title}</h2>
      {sub && <span className="text-[11px] text-faint">{sub}</span>}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {["a", "b", "c", "d"].map((k) => (
          <div key={k} className="h-[92px] rounded-xl border border-line skeleton" />
        ))}
      </div>
      {["a", "b", "c"].map((k) => (
        <div key={k} className="h-[180px] rounded-xl border border-line skeleton" />
      ))}
    </div>
  );
}

export default function Home() {
  const { data: raw, isLoading, error } = useCoveredCalls();
  const data = raw as CoveredCallsPayload | undefined;

  const recs = useMemo<Recommendation[]>(() => data?.recommendations ?? [], [data]);

  const { attention, routine } = useMemo(() => {
    const byScore = (a: Recommendation, b: Recommendation) =>
      (b.after_tax_score ?? -Infinity) - (a.after_tax_score ?? -Infinity);
    const att = recs
      .filter((r) => r.urgency !== "ROUTINE")
      .sort((a, b) => URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency] || byScore(a, b));
    const rout = recs
      .filter((r) => r.urgency === "ROUTINE")
      .sort((a, b) => Number(isQuiet(a)) - Number(isQuiet(b)) || byScore(a, b));
    return { attention: att, routine: rout };
  }, [recs]);

  const scanSorted = useMemo(
    () =>
      [...recs].sort(
        (a, b) =>
          URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency] ||
          Number(isQuiet(a)) - Number(isQuiet(b))
      ),
    [recs]
  );

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar data={data} />
      <DisclaimerGate />

      <main className="flex-1 w-full mx-auto max-w-[1180px] px-5 py-6">
        {/* Intro */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-ink tracking-tight">
            {data?.as_of ? `Today's decisions · ${fmtDateYear(data.as_of)}` : "Today's decisions"}
          </h1>
          {data?.brief && (
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted max-w-3xl">{data.brief}</p>
          )}
        </div>

        {error ? (
          <div className="rounded-xl border border-exit/30 bg-exit/10 text-exit-on p-4 text-sm">
            Couldn&apos;t load the desk — {(error as Error).message}.
          </div>
        ) : isLoading ? (
          <Skeleton />
        ) : recs.length === 0 ? (
          <div className="rounded-xl border border-line bg-surface p-10 text-center">
            <p className="text-ink text-sm font-semibold">No run yet</p>
            <p className="text-muted text-sm mt-1">
              The engine hasn&apos;t pushed a cycle. The desk refreshes automatically once it does.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Portfolio overview */}
            {data?.portfolio && (
              <PortfolioStrip portfolio={data.portfolio} performance={data.performance} />
            )}

            {/* Needs attention */}
            {attention.length > 0 && (
              <section>
                <SectionHeading title="Needs attention" sub={`${attention.length} to act on`} />
                <div className="space-y-3">
                  {attention.map((r) => (
                    <DecisionCard key={r.ticker} rec={r} />
                  ))}
                </div>
              </section>
            )}

            {/* Routine */}
            {routine.length > 0 && (
              <section>
                <SectionHeading title="Routine" sub={`${routine.length} this cycle`} />
                <div className="grid lg:grid-cols-2 gap-3">
                  {routine.map((r) => (
                    <DecisionCard key={r.ticker} rec={r} />
                  ))}
                </div>
              </section>
            )}

            {/* Scan table */}
            <section>
              <SectionHeading title="All positions" sub="cross-position scan" />
              <ScanTable recs={scanSorted} />
            </section>

            {/* Performance */}
            <section>
              <SectionHeading title="Performance" />
              <PerformancePanel performance={data!.performance} />
            </section>

            {/* Methodology */}
            <section>{data && <Methodology data={data} />}</section>

            {/* Flags (anomaly reviewer), if any */}
            {data && data.flags.length > 0 && (
              <section>
                <SectionHeading title="Flags" />
                <div className="rounded-xl border border-hold/30 bg-hold/5 p-4">
                  <Eyebrow>Anomaly reviewer</Eyebrow>
                  <ul className="mt-2 space-y-1.5">
                    {data.flags.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[13px] text-hold-on">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-hold shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
