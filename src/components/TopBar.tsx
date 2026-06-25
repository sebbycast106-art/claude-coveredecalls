"use client";

import { post } from "@/lib/api";
import { BRAND } from "@/lib/brand";
import type { CoveredCallsPayload } from "@/lib/contract";
import { fmtDateLong } from "@/lib/format";

function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <svg
        className="w-5 h-5 text-accent shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="8.6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7.6 12h8.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="font-serif text-[19px] text-ink tracking-[-0.01em] leading-none">
        {BRAND.name}
      </span>
    </div>
  );
}

export function TopBar({ data }: { data: CoveredCallsPayload | undefined }) {
  const demo = data?.mode === "demo";
  const asOf = data?.as_of;

  const handleLogout = async () => {
    try {
      await post("/auth/logout");
    } catch {
      /* ignore */
    }
    window.location.href = "/login";
  };

  return (
    <div>
      {demo && (
        <div className="bg-accent-soft border-b border-accent/15 text-accent text-[11px] font-semibold text-center py-1.5 px-4 tracking-[0.04em] uppercase">
          Sample data — illustrative figures, not a live account
        </div>
      )}
      <header className="border-b border-line bg-canvas">
        <div className="mx-auto max-w-[1120px] px-6 h-16 flex items-center justify-between gap-4">
          <Wordmark />
          <div className="flex items-center gap-5">
            {asOf && (
              <span className="hidden sm:block text-[11.5px] text-faint tnum leading-none">
                As of {fmtDateLong(asOf)} · modeled, delayed quotes
              </span>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="text-[12px] text-muted hover:text-ink transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}
