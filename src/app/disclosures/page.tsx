import Link from "next/link";
import { BRAND } from "@/lib/brand";

const DISCLAIMERS = [
  "For informational and illustrative purposes only. Not investment advice, not a recommendation to buy or sell any security, and not an offer or solicitation.",
  "Analyze-only: this tool does not place trades, connect to any brokerage, or move money. All figures are model outputs; the user independently makes and executes any decisions.",
  "A personal project built for the author's own use. No advisory, fiduciary, or client relationship is created by viewing it.",
  "Prices and option data are modeled and may be delayed (~15 min). Figures are estimates, including after-tax calculations, which depend on assumptions that may not match your situation.",
  "Provided as-is, without warranty. Past performance does not indicate future results.",
  "Tax treatment shown is illustrative and not tax advice; consult a professional.",
  "An independent personal project. Not affiliated with, endorsed by, or representing any employer or firm.",
];

export default function DisclosuresPage() {
  return (
    <main className="mx-auto max-w-[760px] px-5 py-14">
      <Link href="/" className="text-[12px] text-muted hover:text-ink">
        ← Back
      </Link>
      <h1 className="mt-6 text-2xl font-semibold text-ink tracking-tight">Disclosures</h1>
      <p className="mt-2 text-sm text-muted">
        {BRAND.name} — please read before relying on anything here.
      </p>
      <ol className="mt-8 space-y-5">
        {DISCLAIMERS.map((d, i) => (
          <li key={d} className="flex gap-4">
            <span className="text-faint font-mono text-sm shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="text-[13.5px] leading-relaxed text-muted">{d}</p>
          </li>
        ))}
      </ol>
    </main>
  );
}
