"use client";

import { useMemo } from "react";
import { DawnHero } from "@/components/DawnHero";
import { DecisionCard } from "@/components/DecisionCard";
import { Footer } from "@/components/Footer";
import { FullPictureDrawer } from "@/components/FullPictureDrawer";
import { HonestyRibbon } from "@/components/HonestyRibbon";
import { PortfolioStrip } from "@/components/PortfolioStrip";
import { TopBar } from "@/components/TopBar";
import { Eyebrow } from "@/components/ui";
import { useCoveredCalls } from "@/hooks/useCoveredCalls";
import type { CoveredCallsPayload, Recommendation, Urgency } from "@/lib/contract";
import { fmtDateLong } from "@/lib/format";

const URGENCY_RANK: Record<Urgency, number> = { ACT_TODAY: 0, SOON: 1, ROUTINE: 2 };
const isQuiet = (r: Recommendation) => r.action === "STAND_ASIDE" || r.action === "NO_TRADE";
const isHoldish = (r: Recommendation) =>
  r.action === "HOLD" ||
  r.action === "LET_ASSIGN" ||
  r.action === "STAND_ASIDE" ||
  r.action === "NO_TRADE";

function Skeleton() {
  return (
    <div className="space-y-10">
      <div className="h-56 rounded-2xl skeleton" />
      <div className="h-20 rounded-xl skeleton w-2/3" />
      {["a", "b"].map((k) => (
        <div key={k} className="h-64 rounded-xl skeleton" />
      ))}
    </div>
  );
}

export default function Home() {
  const { data: raw, isLoading, error } = useCoveredCalls();
  const data = raw as CoveredCallsPayload | undefined;
  const recs = useMemo<Recommendation[]>(() => data?.recommendations ?? [], [data]);

  // One continuous stack in the existing urgency + score order — a sell-day card
  // floats up, a quiet day reads as one calm run of Holds (no "routine" section).
  const sorted = useMemo(() => {
    const byScore = (a: Recommendation, b: Recommendation) =>
      (b.after_tax_score ?? -Infinity) - (a.after_tax_score ?? -Infinity);
    return [...recs].sort(
      (a, b) =>
        URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency] ||
        Number(isQuiet(a)) - Number(isQuiet(b)) ||
        byScore(a, b)
    );
  }, [recs]);

  // The hero is the one that matters most: the first actionable name, else the
  // NVDA flagship, else whatever sorts first. Its glowing number is a real spot.
  const primary = useMemo(
    () =>
      sorted.find((r) => !isHoldish(r)) ??
      recs.find((r) => r.ticker === "NVDA") ??
      sorted[0] ??
      null,
    [sorted, recs]
  );

  const todo = recs.filter((r) => !isHoldish(r)).length;
  const summary =
    todo === 0
      ? "Nothing needs you today — the book is holding."
      : `${todo} ${todo === 1 ? "thing" : "things"} to look at before the close.`;

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <HonestyRibbon data={data} />
      <TopBar data={data} />

      <main className="flex-1 w-full mx-auto max-w-[760px] px-5 sm:px-6 py-9">
        {error ? (
          <div className="rounded-xl border border-risk/25 bg-risk-soft text-risk p-5 text-sm">
            Couldn&apos;t load this morning&apos;s brief — {(error as Error).message}. It&apos;ll be
            here once the connection is back.
          </div>
        ) : isLoading ? (
          <Skeleton />
        ) : recs.length === 0 ? (
          <div className="rounded-2xl dawn-wash px-7 py-12 text-center">
            <p className="font-serif font-light text-white text-[26px]">
              The brief isn&apos;t in yet.
            </p>
            <p className="mt-2 text-[14px] text-white/80">
              The engine publishes each market morning — this page fills in the moment it does.
            </p>
          </div>
        ) : (
          <div className="space-y-11">
            {/* Masthead */}
            <header>
              <Eyebrow>{fmtDateLong(data?.as_of)} · at the open</Eyebrow>
              <h1 className="mt-2 font-serif font-light text-ink tracking-[-0.01em] leading-tight text-[clamp(34px,7vw,48px)]">
                Good morning, Yoryi.
              </h1>
              <p className="mt-2 text-[14.5px] text-muted">{summary}</p>
            </header>

            {/* Living hero — the one you're watching */}
            <DawnHero rec={primary} />

            {/* The note — the engine's own words, the son's opening voice */}
            {data?.brief && (
              <p className="font-serif font-normal text-[18px] text-muted leading-relaxed max-w-[62ch] whitespace-pre-line">
                {data.brief}
              </p>
            )}

            {/* The verdict stack — one confident card per name */}
            <div className="space-y-6">
              {sorted.map((r) => (
                <DecisionCard key={r.ticker} rec={r} />
              ))}
            </div>

            {/* State of the book */}
            {data?.portfolio && (
              <PortfolioStrip portfolio={data.portfolio} performance={data.performance} />
            )}

            {/* Everything else, one click away */}
            {data && <FullPictureDrawer recs={sorted} data={data} />}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
