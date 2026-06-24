import type { Recommendation } from "@/lib/contract";
import { fmtMoney } from "@/lib/format";

// Covered-call P/L-at-expiration curve with breakeven + strike marked.
// Solid = at expiration (institutional convention). Pure SVG, no gradients.
export function PayoffDiagram({ rec }: { rec: Recommendation }) {
  const strike = rec.open_call?.open_strike ?? rec.strike;
  const premium = rec.open_call?.entry_premium_per_share ?? rec.net_premium_per_share;
  const spot = rec.spot;
  if (strike == null || premium == null || spot == null) return null;

  // Basis proxy: use breakeven (spot − premium) as the cost anchor for the line.
  const basis = rec.breakeven ?? spot - premium;

  const W = 520;
  const H = 150;
  const padL = 8;
  const padR = 8;
  const padT = 14;
  const padB = 22;

  // Price axis range around the strike/spot.
  const lo = Math.min(basis, spot) * 0.92;
  const hi = strike * 1.12;
  const x = (p: number) => padL + ((p - lo) / (hi - lo)) * (W - padL - padR);

  // P/L per share at expiration: below strike → (S − basis) + premium − (S − basis)... covered call:
  // payoff = min(S, strike) − basis + premium  (capped at strike − basis + premium).
  const pl = (S: number) => Math.min(S, strike) - basis + premium;
  const maxProfit = strike - basis + premium;
  const minShown = pl(lo);
  const plLo = Math.min(minShown, 0) * 1.1;
  const plHi = maxProfit * 1.25 || 1;
  const y = (v: number) => padT + (1 - (v - plLo) / (plHi - plLo)) * (H - padT - padB);

  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const S = lo + ((hi - lo) * i) / 60;
    pts.push(`${x(S).toFixed(1)},${y(pl(S)).toFixed(1)}`);
  }

  const zeroY = y(0);
  const beX = x(basis);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      role="img"
      aria-label="Payoff at expiration"
    >
      {/* zero line */}
      <line
        x1={padL}
        y1={zeroY}
        x2={W - padR}
        y2={zeroY}
        stroke="var(--color-line)"
        strokeWidth="1"
      />
      {/* strike marker */}
      <line
        x1={x(strike)}
        y1={padT}
        x2={x(strike)}
        y2={H - padB}
        stroke="var(--color-line-strong)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <text
        x={x(strike)}
        y={H - 7}
        fill="var(--color-faint)"
        fontSize="9"
        textAnchor="middle"
        className="font-mono"
      >
        strike {fmtMoney(strike, 0)}
      </text>
      {/* breakeven marker */}
      <line
        x1={beX}
        y1={padT}
        x2={beX}
        y2={H - padB}
        stroke="var(--color-line-strong)"
        strokeWidth="1"
        strokeDasharray="1 3"
      />
      <text
        x={beX}
        y={H - 7}
        fill="var(--color-faint)"
        fontSize="9"
        textAnchor="middle"
        className="font-mono"
      >
        be {fmtMoney(basis, 0)}
      </text>
      {/* payoff curve */}
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* max-profit cap label */}
      <text
        x={W - padR}
        y={y(maxProfit) - 4}
        fill="var(--color-faint)"
        fontSize="9"
        textAnchor="end"
        className="font-mono"
      >
        cap {fmtMoney(maxProfit)}/sh
      </text>
    </svg>
  );
}
