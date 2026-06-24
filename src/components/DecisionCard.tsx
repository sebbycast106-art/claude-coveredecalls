"use client";

import { useState } from "react";
import { LifecycleStepper } from "@/components/LifecycleStepper";
import { PayoffDiagram } from "@/components/PayoffDiagram";
import {
  ActionBadge,
  BelowTargetChip,
  EventBadge,
  ExposureBadge,
  Eyebrow,
  Pill,
  QccBadge,
  RiskPill,
} from "@/components/ui";
import { ACTION_META, TONE_CLASSES, TRIGGER_LABEL } from "@/lib/actions";
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

const TONE_VAR: Record<string, string> = {
  enter: "var(--color-enter)",
  hold: "var(--color-hold)",
  roll: "var(--color-roll)",
  exit: "var(--color-exit)",
  neutral: "var(--color-neutral)",
};

function Metric({
  label,
  value,
  sub,
  valueClass,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Eyebrow>{label}</Eyebrow>
      <span className={cn("text-[15px] font-semibold tnum text-ink leading-none", valueClass)}>
        {value}
      </span>
      {sub && <span className="text-[10.5px] text-faint tnum leading-none">{sub}</span>}
    </div>
  );
}

function CopySymbol({ symbol }: { symbol: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(symbol).then(
          () => {
            setDone(true);
            setTimeout(() => setDone(false), 1200);
          },
          () => {}
        );
      }}
      title={`Copy ${symbol}`}
      className="font-mono text-[10.5px] text-faint hover:text-muted transition-colors"
    >
      {done ? "copied ✓" : symbol}
    </button>
  );
}

function ProfitBar({ pct, accent }: { pct: number; accent: string }) {
  const w = Math.max(0, Math.min(1, pct));
  const underwater = pct < 0;
  return (
    <div className="flex flex-col gap-1">
      <Eyebrow>Max profit captured</Eyebrow>
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-full max-w-[140px] rounded-full bg-sunken overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${w * 100}%`,
              backgroundColor: underwater ? "var(--color-exit)" : accent,
            }}
          />
        </div>
        <span
          className={cn("text-[13px] font-semibold tnum", underwater ? "text-exit-on" : "text-ink")}
        >
          {fmtPct0(pct)}
        </span>
      </div>
    </div>
  );
}

function MetricGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3.5">{children}</div>;
}

export function DecisionCard({ rec }: { rec: Recommendation }) {
  const [open, setOpen] = useState(false);
  const meta = ACTION_META[rec.action];
  const tone = TONE_CLASSES[meta.tone];
  const accent = TONE_VAR[meta.tone];
  const oc = rec.open_call;
  const rt = rec.roll_target;
  const isOpenPos = oc != null;
  const quiet = rec.action === "STAND_ASIDE" || rec.action === "NO_TRADE";
  const human =
    parseOcc(rec.contract_symbol)?.human ?? contractLabel(rec.ticker, rec.strike, rec.expiry);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-line",
        quiet ? "bg-surface" : "bg-raised"
      )}
    >
      {/* action-color left rail */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-[5px]",
          rec.urgency === "ACT_TODAY" && "pulse-once"
        )}
        style={{ backgroundColor: accent }}
        aria-hidden="true"
      />

      <div className="pl-5 pr-4 py-4">
        {/* Header: ticker + state + action answer */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xl font-semibold font-mono text-ink tracking-tight">
              {rec.ticker}
            </span>
            <Pill
              className={cn(
                "border",
                isOpenPos
                  ? "border-line-strong bg-sunken text-muted"
                  : "border-line bg-sunken text-faint"
              )}
            >
              {isOpenPos ? "CALL OPEN" : "FLAT"}
            </Pill>
            {rec.urgency === "ACT_TODAY" && (
              <Pill className="border-exit/40 bg-exit/15 text-exit-on">ACT TODAY</Pill>
            )}
            {rec.urgency === "SOON" && (
              <Pill className="border-hold/30 bg-hold/10 text-hold-on">soon</Pill>
            )}
          </div>
          <ActionBadge action={rec.action} />
        </div>

        {/* Headline (verbatim) + owner verb */}
        <div className="mt-3">
          <p className="text-[15px] leading-snug font-medium text-ink">{rec.headline}</p>
          <p className={cn("mt-1 text-[12.5px]", tone.on)}>
            {meta.framing} — {meta.ownerVerb.toLowerCase()}.
          </p>
        </div>

        {/* Badges */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {!quiet && <QccBadge qualified={rec.qcc_qualified} itm={oc?.qcc_currently_itm} />}
          <ExposureBadge st={rec.st_shares_written} />
          {rec.ex_div_before_expiry && <EventBadge kind="ex-div" />}
          {rec.earnings_before_expiry && <EventBadge kind="earnings" />}
          {rec.below_target && rec.action === "ENTER" && <BelowTargetChip />}
        </div>

        {/* ── Body: state-specific ─────────────────────────────────────────── */}
        {quiet ? (
          <p className="mt-4 text-[13px] leading-relaxed text-muted">
            {rec.no_trade_reason ?? rec.rationale}
          </p>
        ) : !isOpenPos ? (
          /* ENTER — candidate write */
          <div className="mt-4 space-y-3.5">
            <div className="flex items-center gap-2 text-[13px]">
              <span className="text-ink font-medium">{human}</span>
              {rec.contract_symbol && <CopySymbol symbol={rec.contract_symbol} />}
            </div>
            <MetricGrid>
              <Metric
                label="Net premium / sh"
                value={fmtMoneySigned(rec.net_premium_per_share, 2)}
                sub={`${fmtMoney(rec.gross_premium_total, 0)} on ${rec.contracts}×`}
                valueClass="text-enter-on"
              />
              <Metric
                label="Yield"
                value={fmtPct1(rec.monthly_yield)}
                sub={`${fmtPct0(rec.annualized_yield)} annualized`}
                valueClass={rec.below_target ? "text-hold-on" : undefined}
              />
              <Metric
                label="Assignment risk"
                value={<RiskPill p={rec.prob_assignment_rw} />}
                sub={`Δ ${fmtNum(rec.delta)}`}
              />
              <Metric
                label="Breakeven"
                value={fmtMoney(rec.breakeven)}
                sub={`spot ${fmtMoney(rec.spot)}`}
              />
            </MetricGrid>
          </div>
        ) : (
          /* OPEN — manage existing call */
          <div className="mt-4 space-y-3.5">
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
                <ProfitBar pct={oc.pct_max_profit_captured} accent={accent} />
              </div>
              <Metric
                label="Delta now"
                value={fmtNum(oc.current_delta)}
                sub={`from ${fmtNum(oc.entry_delta)} at entry`}
              />
              <Metric
                label="Assignment now"
                value={<RiskPill p={oc.assignment_prob_now} />}
                sub={oc.is_itm ? "in the money" : "out of the money"}
              />
              <Metric
                label="Option P/L"
                value={fmtMoneySigned(oc.unrealized_option_pl_total, 0)}
                sub={`${fmtPctSigned(oc.distance_to_strike)} to strike`}
                valueClass={oc.unrealized_option_pl_total >= 0 ? "text-up" : "text-down"}
              />
            </MetricGrid>

            {/* ROLL — current vs proposed */}
            {rt && (
              <div className="rounded-lg border border-roll/25 bg-roll-tint/60 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-[12.5px]">
                    <div>
                      <Eyebrow>Current</Eyebrow>
                      <div className="text-muted tnum mt-1">
                        {fmtMoney(oc.open_strike, 0)} · {fmtDateYear(oc.open_expiry)}
                      </div>
                    </div>
                    <span className="text-roll-on text-lg">→</span>
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
                        rt.net_credit_per_share >= 0 ? "text-up" : "text-down"
                      )}
                    >
                      {fmtMoneySigned(rt.net_credit_total, 0)}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {rt.preserves_qcc && (
                    <Pill className="border-enter/30 bg-enter/10 text-enter-on">keeps QCC</Pill>
                  )}
                  {rt.roll_is_defensive && (
                    <Pill className="border-exit/30 bg-exit/10 text-exit-on">
                      defensive (debit)
                    </Pill>
                  )}
                  <Pill className="border-line bg-sunken text-faint">
                    Δ {fmtNum(rt.new_delta)} · {rt.new_dte}d
                  </Pill>
                </div>
              </div>
            )}

            {/* LET_ASSIGN — proceeds note */}
            {rec.action === "LET_ASSIGN" && (
              <div className="rounded-lg border border-hold/25 bg-hold-tint/60 px-3 py-2 text-[12.5px] text-hold-on">
                Assignment proceeds ≈ {fmtMoney(oc.open_strike + oc.entry_premium_per_share, 2)}/sh
                (strike + premium), realized at the long-term rate.
              </div>
            )}
          </div>
        )}

        {/* Lifecycle + rationale */}
        <div className="mt-4 pt-3.5 border-t border-line">
          <LifecycleStepper rec={rec} accent={accent} />
          <p className="mt-3 text-[12.5px] leading-relaxed text-muted">{rec.rationale}</p>
          {rec.action_reason ? (
            <p className="mt-2 text-[11.5px] text-faint">{rec.action_reason}</p>
          ) : rec.action_trigger && rec.action_trigger !== "NONE" ? (
            <p className="mt-2 text-[11.5px] text-faint">{TRIGGER_LABEL[rec.action_trigger]}</p>
          ) : null}
        </div>

        {/* Expand: payoff + secondary metrics */}
        {!quiet && (
          <>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="mt-3 text-[11.5px] font-medium text-muted hover:text-ink transition-colors"
            >
              {open ? "Hide detail ▲" : "Show payoff & detail ▼"}
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
                    {oc && (
                      <DetailItem
                        label="Extrinsic left"
                        value={`${fmtMoney(oc.extrinsic_value_remaining)}/sh`}
                      />
                    )}
                  </dl>
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
      <dt className="text-[10.5px] text-faint uppercase tracking-wide">{label}</dt>
      <dd className="text-ink tnum">{value}</dd>
    </div>
  );
}
