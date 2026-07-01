import type { CoveredCallsPayload } from "@/lib/contract";
import { fmtDateLong } from "@/lib/format";
import { cn } from "@/lib/utils";

// Persistent, always-visible (incl. mobile) honesty strip. Wired to the real
// prices_are_modeled / data_delay_minutes / stale fields — never a hard-coded
// string, never hidden behind a breakpoint. Turns amber when the feed was stale.
export function HonestyRibbon({ data }: { data: CoveredCallsPayload | undefined }) {
  const stale = Boolean(data?.stale);
  const delay = data?.data_delay_minutes ?? 15;
  const asOf = data?.as_of;

  return (
    <div
      className={cn(
        "w-full text-center text-[11px] font-medium tracking-[0.02em] py-1.5 px-4 border-b",
        stale ? "bg-risk-soft text-risk border-risk/25" : "bg-sunken text-muted border-line"
      )}
    >
      {stale
        ? `Prices may be stale — last good read ${asOf ? fmtDateLong(asOf) : "unknown"}. Check before acting.`
        : `Modeled prices · ~${delay}-min delayed · not executable · analyze-only`}
    </div>
  );
}
