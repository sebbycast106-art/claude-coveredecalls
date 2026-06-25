import { fmtPctSigned } from "@/lib/format";
import { cn } from "@/lib/utils";

// All charts are pure CSS/SVG (no chart lib). Light-mode: accent one series,
// grey the rest; direct labels, hairline baselines, no legends.

// Monthly-yield bullet vs the ~2%/mo house target. Navy at/above target, burnt-
// orange below. A grey tick marks the target. Sits under the yield number.
export function YieldBullet({
  monthly,
  target = 0.02,
}: {
  monthly: number | null;
  target?: number;
}) {
  if (monthly == null) return <div className="h-1.5" />;
  const max = Math.max(0.035, monthly * 1.25, target * 1.5);
  const w = `${Math.min(100, (monthly / max) * 100)}%`;
  const t = `${Math.min(100, (target / max) * 100)}%`;
  const above = monthly >= target;
  return (
    <div
      className="relative h-1.5 w-full rounded-full bg-sunken"
      title={`target ${(target * 100).toFixed(0)}%/mo`}
    >
      <div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ width: w, backgroundColor: above ? "var(--color-accent)" : "var(--color-risk)" }}
      />
      <div className="absolute -inset-y-0.5 w-px bg-line-strong" style={{ left: t }} />
    </div>
  );
}

// Assignment-probability bar, 0–100%. Burnt-orange fill, grey tick at ~50%.
export function AssignmentRiskBar({ p }: { p: number | null }) {
  if (p == null) return <div className="h-1.5" />;
  return (
    <div className="relative h-1.5 w-full rounded-full bg-sunken" title="~50% = likely assigned">
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-risk"
        style={{ width: `${Math.min(100, p * 100)}%` }}
      />
      <div className="absolute -inset-y-0.5 left-1/2 w-px bg-line-strong" />
    </div>
  );
}

// Book covered vs uncovered — single 100% stacked bar.
export function CoveredBar({ covered, total }: { covered: number; total: number }) {
  const pct = total ? covered / total : 0;
  return (
    <div className="flex h-2 w-full overflow-hidden rounded-sm bg-sunken">
      <div className="bg-accent" style={{ width: `${pct * 100}%` }} />
    </div>
  );
}

// Ranked horizontal bars for a benchmark comparison. The accented row is navy,
// the rest grey; bar length tells the honest story even when a peer wins.
export function RankedBars({
  rows,
}: {
  rows: { label: string; value: number | null; accent?: boolean }[];
}) {
  const max = Math.max(0.0001, ...rows.map((r) => Math.abs(r.value ?? 0)));
  return (
    <div className="space-y-2.5">
      {rows.map((r) => {
        const w = r.value == null ? 0 : Math.min(100, (Math.abs(r.value) / max) * 100);
        return (
          <div key={r.label} className="flex items-center gap-3">
            <span
              className={cn(
                "w-24 shrink-0 text-[12px]",
                r.accent ? "text-ink font-medium" : "text-muted"
              )}
            >
              {r.label}
            </span>
            <div className="relative h-4 flex-1">
              <div
                className="absolute inset-y-0 left-0"
                style={{
                  width: `${w}%`,
                  backgroundColor: r.accent ? "var(--color-accent)" : "var(--color-line-strong)",
                }}
              />
            </div>
            <span
              className={cn(
                "w-16 shrink-0 text-right text-[12.5px] tnum tabular-nums",
                r.value == null ? "text-faint" : r.value >= 0 ? "text-ink" : "text-neg"
              )}
            >
              {r.value == null ? "—" : fmtPctSigned(r.value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
