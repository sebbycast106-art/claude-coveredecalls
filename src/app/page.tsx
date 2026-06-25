"use client";

import { useMemo } from "react";
import { DecisionCard } from "@/components/DecisionCard";
import { Footer } from "@/components/Footer";
import { PerformancePanel } from "@/components/PerformancePanel";
import { PortfolioStrip } from "@/components/PortfolioStrip";
import { ScanTable } from "@/components/ScanTable";
import { TopBar } from "@/components/TopBar";
import { Eyebrow, SectionTitle } from "@/components/ui";
import { useCoveredCalls } from "@/hooks/useCoveredCalls";
import type { CoveredCallsPayload, Recommendation, Urgency } from "@/lib/contract";
import { fmtMoney0 } from "@/lib/format";

const URGENCY_RANK: Record<Urgency, number> = { ACT_TODAY: 0, SOON: 1, ROUTINE: 2 };
const isQuiet = (r: Recommendation) => r.action === "STAND_ASIDE" || r.action === "NO_TRADE";

function SectionHead({ eyebrow, title, note }: { eyebrow: string; title: string; note?: string }) {
  return (
    <div className="mb-5">
      <Eyebrow>{eyebrow}</Eyebrow>
      <div className="mt-2 flex items-baseline justify-between gap-4">
        <SectionTitle className="text-[20px]">{title}</SectionTitle>
        {note && <span className="text-[11.5px] text-faint shrink-0">{note}</span>}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-10">
      <div className="h-20 rounded skeleton w-72" />
      <div className="h-24 rounded-lg skeleton" />
      {["a", "b", "c"].map((k) => (
        <div key={k} className="h-44 rounded-lg skeleton" />
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

  const hero = useMemo(() => {
    const enterGross = recs
      .filter((r) => r.action === "ENTER")
      .reduce((s, r) => s + (r.gross_premium_total ?? 0), 0);
    const openIncome = data?.portfolio?.expected_monthly_income ?? 0;
    const value = enterGross + openIncome;
    const writes = recs.filter((r) => r.action === "ENTER").length;
    const covered = data?.portfolio?.open_call_count ?? 0;
    return { value, writes, covered };
  }, [recs, data]);

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <TopBar data={data} />

      <main className="flex-1 w-full mx-auto max-w-[1120px] px-6 py-10">
        {error ? (
          <div className="rounded-lg border border-risk/25 bg-risk-soft text-risk p-4 text-sm">
            Couldn&apos;t load the analysis — {(error as Error).message}.
          </div>
        ) : isLoading ? (
          <Skeleton />
        ) : recs.length === 0 ? (
          <div className="rounded-lg border border-line bg-surface exhibit p-12 text-center">
            <p className="font-serif text-xl text-ink">No analysis yet</p>
            <p className="text-muted text-sm mt-1.5">
              The engine hasn&apos;t published a cycle. This page refreshes once it does.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Hero thesis */}
            <header>
              <Eyebrow>Modeled monthly premium</Eyebrow>
              <p className="mt-3 font-serif font-light text-ink tnum leading-none text-[clamp(40px,7vw,54px)]">
                {hero.value > 0 ? fmtMoney0(hero.value) : "—"}
                {hero.value > 0 && (
                  <span className="text-muted text-[22px] font-normal"> / mo</span>
                )}
              </p>
              <p className="mt-3.5 font-serif text-[15.5px] text-muted leading-relaxed max-w-xl">
                {hero.value > 0
                  ? `What the book is engineered to collect this cycle — ${hero.covered} covered ${hero.covered === 1 ? "position" : "positions"} and ${hero.writes} recommended ${hero.writes === 1 ? "write" : "writes"}, modeled net of tax.`
                  : "No premium modeled to collect this cycle."}
              </p>
            </header>

            {/* Portfolio rollup */}
            {data?.portfolio && (
              <PortfolioStrip portfolio={data.portfolio} performance={data.performance} />
            )}

            {/* Needs attention */}
            {attention.length > 0 && (
              <section>
                <SectionHead
                  eyebrow="Decisions"
                  title={`${attention.length} ${attention.length === 1 ? "position needs" : "positions need"} attention this cycle`}
                />
                <div className="space-y-4">
                  {attention.map((r) => (
                    <DecisionCard key={r.ticker} rec={r} />
                  ))}
                </div>
              </section>
            )}

            {/* Routine */}
            {routine.length > 0 && (
              <section>
                <SectionHead
                  eyebrow="Routine"
                  title="The rest of the book"
                  note={`${routine.length} this cycle`}
                />
                <div className="grid lg:grid-cols-2 gap-4">
                  {routine.map((r) => (
                    <DecisionCard key={r.ticker} rec={r} />
                  ))}
                </div>
              </section>
            )}

            {/* Exhibit 1 — scan */}
            <section>
              <SectionHead eyebrow="Exhibit 1" title="Every position at a glance" />
              <ScanTable recs={scanSorted} />
            </section>

            {/* Exhibit 2 — performance */}
            <section>
              <SectionHead eyebrow="Exhibit 2" title="Income vs simply holding" />
              <PerformancePanel performance={data!.performance} />
            </section>

            {/* Flags (quiet, if any) */}
            {data && data.flags.length > 0 && (
              <section>
                <Eyebrow>Review flags</Eyebrow>
                <ul className="mt-3 space-y-1.5">
                  {data.flags.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[12.5px] text-muted">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-risk shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
