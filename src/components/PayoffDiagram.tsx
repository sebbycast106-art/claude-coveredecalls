import type { Recommendation } from "@/lib/contract";
import { fmtMoney } from "@/lib/format";

// Covered-call P/L-at-expiration — navy curve on white, grey reference lines,
// a faint shaded "upside capped" region above the strike. No gridlines/legend.
export function PayoffDiagram({ rec }: { rec: Recommendation }) {
  const strike = rec.open_call?.open_strike ?? rec.strike;
  const premium = rec.open_call?.entry_premium_per_share ?? rec.net_premium_per_share;
  const spot = rec.spot;
  if (strike == null || premium == null || spot == null) return null;

  const basis = rec.breakeven ?? spot - premium;
  const W = 520;
  const H = 150;
  const padL = 8;
  const padR = 8;
  const padT = 16;
  const padB = 24;

  const lo = Math.min(basis, spot) * 0.92;
  const hi = strike * 1.12;
  const x = (p: number) => padL + ((p - lo) / (hi - lo)) * (W - padL - padR);

  const pl = (S: number) => Math.min(S, strike) - basis + premium;
  const maxProfit = strike - basis + premium;
  const plLo = Math.min(pl(lo), 0) * 1.1;
  const plHi = maxProfit * 1.25 || 1;
  const y = (v: number) => padT + (1 - (v - plLo) / (plHi - plLo)) * (H - padT - padB);

  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const S = lo + ((hi - lo) * i) / 60;
    pts.push(`${x(S).toFixed(1)},${y(pl(S)).toFixed(1)}`);
  }

  const zeroY = y(0);
  const beX = x(basis);
  const strikeX = x(strike);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      role="img"
      aria-label="Payoff at expiration"
    >
      {/* capped-upside region above the strike */}
      <rect
        x={strikeX}
        y={padT}
        width={W - padR - strikeX}
        height={H - padB - padT}
        fill="var(--color-accent-soft)"
      />
      {/* zero baseline */}
      <line
        x1={padL}
        y1={zeroY}
        x2={W - padR}
        y2={zeroY}
        stroke="var(--color-line)"
        strokeWidth="1"
      />
      {/* strike + breakeven reference lines */}
      <line
        x1={strikeX}
        y1={padT}
        x2={strikeX}
        y2={H - padB}
        stroke="var(--color-line-strong)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <line
        x1={beX}
        y1={padT}
        x2={beX}
        y2={H - padB}
        stroke="var(--color-line-strong)"
        strokeWidth="1"
        strokeDasharray="1 3"
      />
      <text x={strikeX} y={H - 8} fill="var(--color-faint)" fontSize="9.5" textAnchor="middle">
        strike {fmtMoney(strike, 0)}
      </text>
      <text x={beX} y={H - 8} fill="var(--color-faint)" fontSize="9.5" textAnchor="middle">
        breakeven {fmtMoney(basis, 0)}
      </text>
      {/* payoff curve */}
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* cap callout */}
      <text
        x={W - padR}
        y={y(maxProfit) - 5}
        fill="var(--color-faint)"
        fontSize="9.5"
        textAnchor="end"
      >
        capped at {fmtMoney(maxProfit)}/sh
      </text>
    </svg>
  );
}
