import Link from "next/link";

// One tasteful disclosure line — the truthful minimum; the full text lives in the
// Methodology & Disclosures appendix.
export function Footer() {
  return (
    <footer className="border-t border-line mt-16">
      <div className="mx-auto max-w-[1120px] px-6 py-6">
        <p className="text-[11px] text-faint leading-relaxed max-w-3xl">
          Premia is an analysis tool, not a broker — it never places trades. Figures are modeled on
          delayed data and are not investment advice.{" "}
          <Link
            href="/disclosures"
            className="text-muted hover:text-accent underline underline-offset-2"
          >
            Methodology &amp; disclosures →
          </Link>
        </p>
      </div>
    </footer>
  );
}
