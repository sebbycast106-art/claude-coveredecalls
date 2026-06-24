import { ACTION_META, TONE_CLASSES } from "@/lib/actions";
import type { Action } from "@/lib/contract";
import { fmtPct0 } from "@/lib/format";
import { cn } from "@/lib/utils";

// ── Eyebrow — uppercase micro-label used on tiles, columns, sections ─────────
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-[10.5px] font-semibold uppercase tracking-[0.08em] text-faint leading-none",
        className
      )}
    >
      {children}
    </span>
  );
}

// ── Card chrome — hairline border, layered background, no shadow ─────────────
export function Card({
  children,
  className,
  raised,
}: {
  children: React.ReactNode;
  className?: string;
  raised?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-line",
        raised ? "bg-raised" : "bg-surface",
        className
      )}
    >
      {children}
    </div>
  );
}

// ── Generic pill ─────────────────────────────────────────────────────────────
export function Pill({
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10.5px] font-semibold leading-none",
        className
      )}
    >
      {children}
    </span>
  );
}

// ── Action glyph — stroke icon from the taxonomy ─────────────────────────────
export function ActionGlyph({
  action,
  className,
  strokeWidth = 1.75,
}: {
  action: Action;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ACTION_META[action].iconPath} />
    </svg>
  );
}

// ── Action badge — verb + glyph + color (the unmissable answer chip) ─────────
export function ActionBadge({ action, size = "md" }: { action: Action; size?: "sm" | "md" }) {
  const meta = ACTION_META[action];
  const t = TONE_CLASSES[meta.tone];
  const sm = size === "sm";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border font-semibold",
        t.badgeBg,
        t.badgeText,
        t.badgeBorder,
        sm ? "px-1.5 py-0.5 text-[10.5px]" : "px-2 py-1 text-xs"
      )}
    >
      <ActionGlyph action={action} className={sm ? "w-3 h-3" : "w-3.5 h-3.5"} />
      <span className="uppercase tracking-wide">{meta.label}</span>
    </span>
  );
}

// ── Risk pill — % + Low/Mod/High (never hue alone) ───────────────────────────
export function riskTier(p: number | null | undefined): { label: string; cls: string } {
  if (p == null) return { label: "—", cls: "text-faint" };
  if (p < 0.2) return { label: "Low", cls: "text-enter-on" };
  if (p < 0.4) return { label: "Mod", cls: "text-hold-on" };
  return { label: "High", cls: "text-exit-on" };
}

export function RiskPill({ p }: { p: number | null | undefined }) {
  const t = riskTier(p);
  if (p == null) return <span className="text-faint tnum">—</span>;
  return (
    <span className="inline-flex items-baseline justify-end gap-1.5 tnum">
      <span className={cn("font-mono", t.cls)}>{fmtPct0(p)}</span>
      <span className={cn("text-[10px] font-bold uppercase tracking-wide", t.cls)}>{t.label}</span>
    </span>
  );
}

// ── Domain badges ────────────────────────────────────────────────────────────
export function QccBadge({ qualified, itm }: { qualified: boolean | null; itm?: boolean }) {
  if (qualified == null) return <span className="text-faint font-mono text-[11px]">—</span>;
  if (itm) {
    return (
      <Pill
        className="border-exit/30 bg-exit/10 text-exit-on"
        title="ITM qualified covered call — the holding period is suspended (LTCG could convert to STCG)"
      >
        QCC · ITM
      </Pill>
    );
  }
  return qualified ? (
    <Pill
      className="border-enter/30 bg-enter/10 text-enter-on"
      title="Qualified covered call — preserves the stock's long-term holding period"
    >
      QCC ✓
    </Pill>
  ) : (
    <Pill className="border-line bg-sunken text-muted" title="Not a qualified covered call">
      QCC ✕
    </Pill>
  );
}

export function ExposureBadge({ st }: { st: number }) {
  if (!st) return null;
  return (
    <Pill
      className="border-exit/30 bg-exit/10 text-exit-on"
      title={`${st} short-term shares exposed — assignment would be taxed at the higher short-term rate`}
    >
      {st} ST exposed
    </Pill>
  );
}

export function EventBadge({ kind }: { kind: "ex-div" | "earnings" }) {
  const label = kind === "ex-div" ? "ex-div before expiry" : "earnings before expiry";
  return (
    <Pill
      className="border-hold/30 bg-hold/10 text-hold-on"
      title={`${label} — a known assignment / volatility trigger`}
    >
      {label}
    </Pill>
  );
}

export function BelowTargetChip() {
  return (
    <Pill
      className="border-hold/30 bg-hold/10 text-hold-on"
      title="Premium is below the ~2%/mo house target"
    >
      ↓ below 2%/mo
    </Pill>
  );
}
