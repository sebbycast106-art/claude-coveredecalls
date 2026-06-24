import Link from "next/link";

// Standing institutional disclosure on every page.
export function Footer() {
  return (
    <footer className="border-t border-line mt-10">
      <div className="mx-auto max-w-[1180px] px-5 py-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] text-faint text-center">
        <span>Not investment advice</span>
        <span className="text-line-strong">·</span>
        <span>Analyze-only — never places trades</span>
        <span className="text-line-strong">·</span>
        <span>Personal project, not affiliated with any employer</span>
        <span className="text-line-strong">·</span>
        <Link
          href="/disclosures"
          className="text-muted hover:text-ink underline underline-offset-2"
        >
          Full disclosures
        </Link>
      </div>
    </footer>
  );
}
