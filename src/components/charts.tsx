import { fmtMoney, fmtMoney0, fmtPctSigned } from "@/lib/format";
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

// ── Dawn price chart — recent closes vs the 50-day, with the "your cap" strike ─
// The picture that shows WHY it's a hold: the price line sliding under its 50-day
// (and under the dotted strike you'd sell at). Pure inline SVG, no library. Draws
// on once, then holds still (reduced-motion → instant). Hides itself when the
// price series is absent (demo before it's seeded, or an engine push pre-trend).
export function DawnPriceChart({
  recent_closes,
  sma_50,
  strike,
  height = 132,
}: {
  recent_closes: number[] | null | undefined;
  sma_50: number | null | undefined;
  strike?: number | null;
  height?: number;
}) {
  if (!Array.isArray(recent_closes) || recent_closes.length < 5) return null;
  const closes = recent_closes;
  const n = closes.length;
  const W = 640;
  const H = 160;
  const padL = 10;
  const padR = 70;
  const padT = 16;
  const padB = 16;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const baseline = padT + plotH;

  const vals = [...closes];
  if (sma_50 != null && Number.isFinite(sma_50)) vals.push(sma_50);
  if (strike != null && Number.isFinite(strike)) vals.push(strike);
  let min = Math.min(...vals);
  let max = Math.max(...vals);
  if (max === min) max = min + 1;
  const pad = (max - min) * 0.06;
  min -= pad;
  max += pad;

  const x = (i: number) => padL + (i / (n - 1)) * plotW;
  const y = (v: number) => padT + (1 - (v - min) / (max - min)) * plotH;

  const pts = closes.map((c, i) => `${x(i).toFixed(1)},${y(c).toFixed(1)}`);
  const area = `M ${x(0).toFixed(1)},${baseline} L ${pts.join(" L ")} L ${x(n - 1).toFixed(1)},${baseline} Z`;
  const line = `M ${pts.join(" L ")}`;
  const last = closes[n - 1];
  const lastX = x(last === undefined ? 0 : n - 1);
  const lastY = y(last);
  const smaY = sma_50 != null && Number.isFinite(sma_50) ? y(sma_50) : null;
  const strikeIn =
    strike != null && Number.isFinite(strike) && strike >= min && strike <= max ? y(strike) : null;
  const gid = `dawnfill-${Math.round((sma_50 ?? 0) * 100)}-${n}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      role="img"
      aria-label={`Price over the last ${n} sessions versus its 50-day average${strike != null ? ` and the $${Math.round(strike)} strike` : ""}`}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-accent)" stopOpacity="0.16" />
          <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      {smaY != null && (
        <>
          <line
            x1={padL}
            y1={smaY}
            x2={padL + plotW}
            y2={smaY}
            stroke="var(--color-muted)"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.7"
          />
          <text
            x={padL + plotW + 6}
            y={smaY + 3.5}
            fill="var(--color-muted)"
            fontSize="10.5"
            fontFamily="var(--font-sans)"
          >
            50-day {fmtMoney0(sma_50)}
          </text>
        </>
      )}
      {strikeIn != null && (
        <>
          <line
            x1={padL}
            y1={strikeIn}
            x2={padL + plotW}
            y2={strikeIn}
            stroke="var(--color-accent)"
            strokeWidth="1"
            strokeDasharray="1 4"
            opacity="0.8"
          />
          <text
            x={padL + plotW + 6}
            y={strikeIn + 3.5}
            fill="var(--color-accent)"
            fontSize="10.5"
            fontFamily="var(--font-sans)"
          >
            cap {fmtMoney0(strike)}
          </text>
        </>
      )}
      <path
        d={line}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1"
        className="animate-line"
        style={{ ["--dash" as string]: "1" } as React.CSSProperties}
      />
      <circle cx={lastX} cy={lastY} r="7" fill="var(--dawn-gold)" opacity="0.35" />
      <circle cx={lastX} cy={lastY} r="3.5" fill="var(--color-accent)" />
      <text
        x={lastX - 6}
        y={lastY - 9}
        fill="var(--color-ink)"
        fontSize="12"
        fontWeight="500"
        textAnchor="end"
        fontFamily="var(--font-sans)"
      >
        {fmtMoney(last)}
      </text>
    </svg>
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
