"use client";

import { Pill } from "@/components/ui";
import { post } from "@/lib/api";
import { BRAND } from "@/lib/brand";
import type { CoveredCallsPayload } from "@/lib/contract";
import { fmtDateYear, fmtTimestamp } from "@/lib/format";

function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      {/* Theta glyph */}
      <svg
        className="w-6 h-6 text-accent shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="8.4" stroke="currentColor" strokeWidth="1.7" />
        <path d="M7.7 12h8.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
      <div className="leading-none">
        <div className="text-[15px] font-semibold text-ink tracking-tight">{BRAND.name}</div>
      </div>
    </div>
  );
}

export function TopBar({ data }: { data: CoveredCallsPayload | undefined }) {
  const demo = data?.mode === "demo";
  const stale = data?.stale ?? false;
  const asOf = data?.as_of;
  const generated = data?.generated_at;
  const delay = data?.data_delay_minutes;

  const handleLogout = async () => {
    try {
      await post("/auth/logout");
    } catch {
      /* ignore */
    }
    window.location.href = "/login";
  };

  return (
    <div className="sticky top-0 z-30">
      {demo && (
        <div className="bg-hold/15 border-b border-hold/25 text-hold-on text-[11.5px] font-semibold text-center py-1.5 px-4 tracking-wide">
          SAMPLE DATA — illustrative figures, not a live account
        </div>
      )}
      <header className="border-b border-line bg-base/85 backdrop-blur-md">
        <div className="mx-auto max-w-[1180px] px-5 h-14 flex items-center justify-between gap-4">
          <Wordmark />
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-faint font-mono tnum">
              {asOf && <span>as of {fmtDateYear(asOf)}</span>}
              {generated && <span className="text-line-strong">·</span>}
              {generated && (
                <span className="hidden md:inline">generated {fmtTimestamp(generated)}</span>
              )}
              {stale ? (
                <Pill className="border-hold/40 bg-hold/15 text-hold-on">STALE</Pill>
              ) : (
                <Pill
                  className="border-line bg-sunken text-faint"
                  title={`Modeled from data delayed ~${delay ?? 15} minutes — not executable quotes`}
                >
                  indicative · ~{delay ?? 15}m delayed
                </Pill>
              )}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="text-[12px] font-medium text-muted hover:text-ink transition-colors px-2.5 py-1.5 rounded-md hover:bg-sunken"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}
