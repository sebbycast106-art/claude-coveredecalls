"use client";

import { useState } from "react";
import { AssignmentRiskBar, DawnPriceChart } from "@/components/charts";
import { PayoffDiagram } from "@/components/PayoffDiagram";
import {
  ActionGlyph,
  BelowTargetChip,
  EventBadge,
  ExposureBadge,
  Eyebrow,
  Pill,
  QccBadge,
  RiskPill,
} from "@/components/ui";
import { ACTION_META, TONE_VAR, TRIGGER_LABEL } from "@/lib/actions";
import type { Recommendation } from "@/lib/contract";
import {
  contractLabel,
  fmtDateYear,
  fmtMoney,
  fmtMoneySigned,
  fmtNum,
  fmtPct0,
  fmtPct1,
  fmtPctSigned,
  parseOcc,
} from "@/lib/format";
import { cn } from "@/lib/utils";

function Metric({
  label,
  value,
  sub,
  chart,
  valueClass,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  chart?: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Eyebrow>{label}</Eyebrow>
      <span className={cn("text-[16px] font-semibold tnum text-ink leading-none", valueClass)}>
        {value}
      </span>
      {chart}
      {sub && <span className="text-[11px] text-faint tnum leading-none">{sub}</span>}
    </div>
  );
}

function CopySymbol({ symbol }: { symbol: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() =>
        navigator.clipboard?.writeText(symbol).then(
          () => {
            setDone(true);
            setTimeout(() => setDone(false), 1200);
          },
          () => {}
        )
      }
      title={`Copy ${symbol}`}
      className="font-mono text-[10.5px] text-faint hover:text-muted transition-colors"
    >
      {done ? "copied ✓" : symbol}
    </button>
  );
}

function ProfitBar({ pct }: { pct: number }) {
  const w = Math.max(0, Math.min(1, pct));
  const underwater = pct < 0;
  return (
    <div className="flex flex-col gap-1.5">
      <Eyebrow>Max profit captured</Eyebrow>
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-full max-w-[120px] rounded-full bg-sunken overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${w * 100}%`,
              backgroundColor: underwater ? "var(--color-risk)" : "var(--color-hold)",
            }}
          />
        </div>
        <span
          className={cn("text-[13px] font-semibold tnum", underwater ? "text-risk" : "text-ink")}
        >
          {fmtPct0(pct)}
        </span>
      </div>
    </div>
  );
}

function MetricGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-4">{children}</div>;
}

export function DecisionCard({ rec }: { rec: Recommendation }) {
  const [open, setOpen] = useState(false);
  const meta = ACTION_META[rec.action];
  const accent = TONE_VAR[meta.tone];
  const oc = rec.open_call;
  const rt = rec.roll_target;
  const isOpenPos = oc != null;
  // "Quiet" = render the reason prose alone, never a grid of dashes. STAND_ASIDE /
  // NO_TRADE are always quiet; a HOLD/LET_ASSIGN with no open-call payload has no
  // write-side numbers either, so it falls here too (defensive — the fresh-write
  // grid would otherwise render four "—" zero-boxes).
  const quiet =
    rec.action === "STAND_ASIDE" ||
    rec.action === "NO_TRADE" ||
    ((rec.action === "HOLD" || rec.action === "LET_ASSIGN") && oc == null);
  const human =
    parseOcc(rec.contract_symbol)?.human ?? contractLabel(rec.ticker, rec.strike, rec.expiry);
  const chartStrike = oc?.open_strike ?? rec.strike ?? null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-surface exhibit">
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ backgroundColor: accent }}
        aria-hidden="true"
      />
      <div className="pl-7 pr-6 py-6">
        {/* Header */}
        <div className="flex items-center gap-2.5">
          <span className="text-[17px] font-semibold text-ink tracking-tight">{rec.ticker}</span>
          <Pill className={cn("border-line bg-sunken", isOpenPos ? "text-muted" : "text-faint")}>
            {isOpenPos ? "Call open" : "Flat"}
          </Pill>
          {rec.urgency === "ACT_TODAY" && (
            <Pill className="border-risk/25 bg-risk-soft text-risk">Act today</Pill>
          )}
        </div>

        {/* The one answer — giant serif verb */}
        <div className="mt-2 flex items-center gap-2.5" style={{ color: accent }}>
          <ActionGlyph action={rec.action} className="w-6 h-6 shrink-0" strokeWidth={1.75} />
          <span className="font-serif font-normal tracking-[-0.01em] leading-none text-[clamp(30px,5vw,38px)]">
            {meta.verb}
          </span>
        </div>

        {/* The reason — the engine's own sentence, verbatim */}
        <p className="mt-3 text-[17px] leading-snug text-ink max-w-2xl">{rec.headline}</p>

        {/* Badges */}
        {(!quiet ||
          rec.st_shares_written > 0 ||
          rec.ex_div_before_expiry ||
          rec.earnings_before_expiry) && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {!quiet && <QccBadge qualified={rec.qcc_qualified} itm={oc?.qcc_currently_itm} />}
            <ExposureBadge st={rec.st_shares_written} />
            {rec.ex_div_before_expiry && <EventBadge kind="ex-div" />}
            {rec.earnings_before_expiry && <EventBadge kind="earnings" />}
            {rec.below_target && rec.action === "ENTER" && <BelowTargetChip />}
          </div>
        )}

        {/* Price chart spine — the picture of why */}
        {Array.isArray(rec.recent_closes) && rec.recent_closes.length >= 5 && (
          <div className="mt-5 rounded-lg border border-line bg-sunken/60 px-3 pt-2 pb-1">
            <DawnPriceChart
              recent_closes={rec.recent_closes}
              sma_50={rec.sma_50}
              strike={chartStrike}
            />
          </div>
        )}

        {/* Per-verb supporting strip (never a zero-filled grid on a quiet day) */}
        {quiet ? null : !isOpenPos ? (
          <div className="mt-5 space-y-4">
            <div className="flex items-center gap-2 text-[13px]">
              <span className="text-ink font-medium">{human}</span>
              {rec.contract_symbol && <CopySymbol symbol={rec.contract_symbol} />}
            </div>
            <MetricGrid>
              <Metric
                label="Net premium / sh"
                value={fmtMoneySigned(rec.net_premium_per_share, 2)}
                sub={`${fmtMoney(rec.gross_premium_total, 0)} on ${rec.contracts}×`}
              />
              <Metric
                label="Monthly yield"
                value={fmtPct1(rec.monthly_yield)}
                sub={`${fmtPct0(rec.annualized_yield)} annualized`}
                valueClass={rec.below_target ? "text-risk" : undefined}
              />
              <Metric
                label="Assignment risk"
                value={<RiskPill p={rec.prob_assignment_rw} />}
                chart={<AssignmentRiskBar p={rec.prob_assignment_rw} />}
                sub={`Δ ${fmtNum(rec.delta)}`}
              />
              <Metric
                label="Upside surrendered"
                value={fmtMoney(rec.foregone_upside_total, 0)}
                sub="if it runs past the cap"
              />
            </MetricGrid>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px]">
              <span className="text-ink font-medium">
                Short {oc.open_contracts}×{" "}
                {parseOcc(oc.open_contract_symbol)?.human ??
                  `${rec.ticker} ${fmtMoney(oc.open_strike, 0)}C`}
              </span>
              <span className="text-faint">
                entered {fmtDateYear(oc.entry_date)} @ {fmtMoney(oc.entry_premium_per_share, 2)} ·{" "}
                {oc.days_held}d held · {oc.open_dte}d left
              </span>
            </div>
            <MetricGrid>
              <div className="col-span-2 sm:col-span-1">
                <ProfitBar pct={oc.pct_max_profit_captured} />
              </div>
              <Metric
                label="Delta now"
                value={fmtNum(oc.current_delta)}
                sub={`from ${fmtNum(oc.entry_delta)} at entry`}
              />
              <Metric
                label="Assignment now"
                value={<RiskPill p={oc.assignment_prob_now} />}
                chart={<AssignmentRiskBar p={oc.assignment_prob_now} />}
                sub={oc.is_itm ? "in the money" : "out of the money"}
              />
              <Metric
                label="Option P/L"
                value={fmtMoneySigned(oc.unrealized_option_pl_total, 0)}
                sub={`${fmtPctSigned(oc.distance_to_strike)} to strike`}
                valueClass={oc.unrealized_option_pl_total >= 0 ? "text-pos" : "text-neg"}
              />
            </MetricGrid>

            {rt && (
              <div className="rounded-lg border border-line bg-sunken px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-[12.5px]">
                    <div>
                      <Eyebrow>Current</Eyebrow>
                      <div className="text-muted tnum mt-1">
                        {fmtMoney(oc.open_strike, 0)} · {fmtDateYear(oc.open_expiry)}
                      </div>
                    </div>
                    <span className="text-faint text-lg">→</span>
                    <div>
                      <Eyebrow>Proposed</Eyebrow>
                      <div className="text-ink tnum mt-1">
                        {fmtMoney(rt.new_strike, 0)} · {fmtDateYear(rt.new_expiry)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Eyebrow>Net {rt.net_credit_per_share >= 0 ? "credit" : "debit"}</Eyebrow>
                    <div
                      className={cn(
                        "text-lg font-semibold tnum mt-1",
                        rt.net_credit_per_share >= 0 ? "text-pos" : "text-neg"
                      )}
                    >
                      {fmtMoneySigned(rt.net_credit_total, 0)}
                    </div>
                  </div>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {rt.preserves_qcc && (
                    <Pill className="border-accent/20 bg-accent-soft text-accent">keeps QCC</Pill>
                  )}
                  {rt.roll_is_defensive && (
                    <Pill className="border-risk/25 bg-risk-soft text-risk">defensive (debit)</Pill>
                  )}
                  <Pill className="border-line bg-surface text-muted">
                    Δ {fmtNum(rt.new_delta)} · {rt.new_dte}d
                  </Pill>
                </div>
              </div>
            )}

            {rec.action === "LET_ASSIGN" && (
              <div className="rounded-lg border border-line bg-hold-soft px-4 py-2.5 text-[12.5px] text-hold">
                Assignment proceeds ≈ {fmtMoney(oc.open_strike + oc.entry_premium_per_share, 2)}/sh
                (strike + premium), realized at the long-term rate.
              </div>
            )}
          </div>
        )}

        {/* Progressive disclosure — payoff + the tiered rigor */}
        {!quiet && (
          <>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="mt-4 text-[12px] text-muted hover:text-accent transition-colors"
            >
              {open ? "Hide the detail ▲" : "Why this call ▼"}
            </button>
            {open && (
              <div className="mt-3 grid lg:grid-cols-2 gap-4 animate-fadeIn">
                <div className="rounded-lg border border-line bg-sunken p-3">
                  <Eyebrow>Payoff at expiration</Eyebrow>
                  <div className="mt-2">
                    <PayoffDiagram rec={rec} />
                  </div>
                </div>
                <div className="rounded-lg border border-line bg-sunken p-3">
                  <Eyebrow>Detail</Eyebrow>
                  <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2.5 text-[12px]">
                    <DetailItem
                      label="Upside surrendered"
                      value={fmtMoney(rec.foregone_upside_total, 0)}
                    />
                    <DetailItem label="Breakeven" value={fmtMoney(rec.breakeven)} />
                    <DetailItem label="Prior close" value={fmtMoney(rec.prior_close)} />
                    <DetailItem
                      label="Engine rank score"
                      value={rec.after_tax_score != null ? fmtNum(rec.after_tax_score, 0) : "—"}
                      hint="A tax-adjusted ranking score (not dollars of profit)."
                    />
                    <DetailItem
                      label="Coverage"
                      value={`${rec.lt_shares_written} LT · ${rec.st_shares_written} ST`}
                    />
                    {oc && (
                      <DetailItem
                        label="Cost to close"
                        value={fmtMoney(oc.cost_to_close_total, 0)}
                      />
                    )}
                  </dl>
                  {(rec.rationale || rec.action_reason) && (
                    <p className="mt-3 pt-3 border-t border-line text-[11.5px] text-muted leading-relaxed">
                      {rec.rationale}
                      {rec.action_trigger && rec.action_trigger !== "NONE" && (
                        <span className="text-faint"> ({TRIGGER_LABEL[rec.action_trigger]})</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function DetailItem({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-0.5" title={hint}>
      <dt className="text-[10px] text-faint uppercase tracking-wide">{label}</dt>
      <dd className="text-ink tnum">{value}</dd>
    </div>
  );
}
