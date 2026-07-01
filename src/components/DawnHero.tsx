import { DawnPriceChart } from "@/components/charts";
import type { Recommendation } from "@/lib/contract";
import { fmtMoney, fmtPctSigned } from "@/lib/format";

// The living sunrise hero. The one glowing number is the primary underlying's
// SPOT (a real price) — never the premium sum that collapses to "—", never the
// rank score. A gold halo blooms once on mount; the price line draws on beneath.
export function DawnHero({ rec }: { rec: Recommendation | null }) {
  if (!rec) return null;

  const spot = rec.spot;
  const prior = rec.prior_close;
  const dayMove = spot != null && prior != null && prior !== 0 ? spot / prior - 1 : null;
  const holdish =
    rec.action === "HOLD" ||
    rec.action === "LET_ASSIGN" ||
    rec.action === "STAND_ASIDE" ||
    rec.action === "NO_TRADE";
  const eyebrow = holdish ? "Steady this morning" : "The one to act on";
  const strike = rec.strike ?? rec.open_call?.open_strike ?? null;

  return (
    <div className="relative overflow-hidden rounded-2xl dawn-wash px-7 py-8 sm:px-9 sm:py-9">
      <div
        className="hero-glow pointer-events-none absolute -top-16 left-2 h-[320px] w-[440px]"
        aria-hidden="true"
      />
      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-white/80">
            {eyebrow} · {rec.ticker}
          </span>
          {dayMove != null && (
            <span className="rounded-full bg-black/30 px-2.5 py-1 text-[13px] font-semibold tnum text-white">
              {fmtPctSigned(dayMove)} today
            </span>
          )}
        </div>

        {spot != null ? (
          <div className="mt-3 flex items-end gap-3">
            <span
              className="animate-glow font-serif font-light tnum leading-none text-white text-[clamp(60px,12vw,100px)]"
              style={{ textShadow: "0 0 44px rgba(246,199,107,0.55)" }}
            >
              {fmtMoney(spot)}
            </span>
            <span className="mb-3 rounded bg-black/30 px-1.5 py-0.5 text-[12px] font-medium text-white">
              modeled
            </span>
          </div>
        ) : (
          <p className="mt-3 font-serif font-light text-white text-[clamp(34px,7vw,48px)]">
            Good morning.
          </p>
        )}

        {Array.isArray(rec.recent_closes) && rec.recent_closes.length >= 5 && (
          <div className="mt-6 rounded-xl border border-white/25 bg-surface/90 px-3 pt-2 pb-1 backdrop-blur-sm">
            <DawnPriceChart recent_closes={rec.recent_closes} sma_50={rec.sma_50} strike={strike} />
          </div>
        )}
      </div>
    </div>
  );
}
