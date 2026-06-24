import type { Recommendation } from "@/lib/contract";
import { cn } from "@/lib/utils";

// Where the position sits in the enter → manage → exit lifecycle.
// Orients "am I in a call, and what's next" at a glance.
const STEPS = ["No call", "Call open", "Near expiry", "Closed / assigned"] as const;

function activeStep(rec: Recommendation): number {
  if (rec.action === "ENTER" || rec.action === "STAND_ASIDE" || rec.action === "NO_TRADE") return 0;
  if (rec.action === "CLOSE" || rec.action === "LET_ASSIGN") return 3;
  const dte = rec.open_call?.open_dte ?? rec.dte ?? 99;
  if (dte <= 21 || rec.action === "ROLL") return 2;
  return 1;
}

export function LifecycleStepper({ rec, accent }: { rec: Recommendation; accent: string }) {
  const active = activeStep(rec);
  return (
    <div className="flex items-center gap-1.5">
      {STEPS.map((label, i) => {
        const on = i <= active;
        return (
          <div key={label} className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: on ? accent : "var(--color-line-strong)" }}
              />
              <span
                className={cn(
                  "text-[10.5px] whitespace-nowrap",
                  i === active ? "text-ink font-semibold" : on ? "text-muted" : "text-faint"
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className="w-4 h-px"
                style={{ backgroundColor: i < active ? accent : "var(--color-line)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
