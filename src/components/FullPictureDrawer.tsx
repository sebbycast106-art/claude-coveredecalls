"use client";

import { useState } from "react";
import { PerformancePanel } from "@/components/PerformancePanel";
import { ScanTable } from "@/components/ScanTable";
import { Eyebrow, SectionTitle } from "@/components/ui";
import type { CoveredCallsPayload, Recommendation } from "@/lib/contract";

// Everything the research-note view used to show, one click away: the scan table,
// the income-vs-holding panel (honest empty states intact), and any review flags.
// Nothing is deleted — only relocated off the 3-second read.
export function FullPictureDrawer({
  recs,
  data,
}: {
  recs: Recommendation[];
  data: CoveredCallsPayload;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-line bg-surface px-5 py-3.5 text-left transition-colors hover:bg-sunken"
      >
        <span className="font-serif text-[17px] text-ink">The full picture</span>
        <span className="text-[12px] text-muted">
          {open ? "Hide ▲" : "Every position, the benchmarks & the fine print ▼"}
        </span>
      </button>

      {open && (
        <div className="mt-6 space-y-10 animate-fadeIn">
          <section>
            <Eyebrow>Exhibit 1</Eyebrow>
            <SectionTitle as="h3" className="mt-2 text-[18px]">
              Every position at a glance
            </SectionTitle>
            <div className="mt-4">
              <ScanTable recs={recs} />
            </div>
          </section>

          <section>
            <Eyebrow>Exhibit 2</Eyebrow>
            <SectionTitle as="h3" className="mt-2 text-[18px]">
              Income vs. simply holding
            </SectionTitle>
            <div className="mt-4">
              <PerformancePanel performance={data.performance} />
            </div>
          </section>

          {data.flags.length > 0 && (
            <section>
              <Eyebrow>Review flags</Eyebrow>
              <ul className="mt-3 space-y-1.5">
                {data.flags.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[12.5px] text-muted">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-risk" />
                    {f}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
