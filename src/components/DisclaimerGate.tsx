"use client";

import { useEffect, useState } from "react";
import { BRAND } from "@/lib/brand";

const KEY = "td_disclaimer_ack_v1";

// One-time per-session disclaimer — sets the not-advice / analyze-only frame
// before any numbers are seen. Stored in sessionStorage so it shows once.
export function DisclaimerGate() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(KEY)) setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  const dismiss = () => {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-line bg-raised p-7 animate-fadeIn">
        <h2 className="text-lg font-semibold text-ink">Before you look</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {BRAND.name} is an{" "}
          <span className="text-ink font-medium">illustrative personal tool</span> — not investment
          advice, and not a recommendation to buy or sell any security. It{" "}
          <span className="text-ink font-medium">does not place trades</span> or connect to any
          brokerage; every figure is a model output that you independently act on.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Prices are modeled and may be delayed. Past performance does not indicate future results.
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="mt-6 w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-[#0d1117] hover:brightness-110 transition"
        >
          I understand
        </button>
      </div>
    </div>
  );
}
