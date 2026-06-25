// ── Display formatting ──────────────────────────────────────────────────────
// All numeric output is destined for .tnum (tabular, slashed-zero) cells.

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function fmtMoney(n: number | null | undefined, digits = 2): string {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function fmtMoney0(n: number | null | undefined): string {
  return fmtMoney(n, 0);
}

// Signed money with explicit + so "premium collected" reads in grayscale.
export function fmtMoneySigned(n: number | null | undefined, digits = 0): string {
  if (n == null || Number.isNaN(n)) return "—";
  const s = fmtMoney(Math.abs(n), digits);
  return n < 0 ? `−${s}` : `+${s}`;
}

export function fmtPct1(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `${(n * 100).toFixed(1)}%`;
}

export function fmtPct0(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `${Math.round(n * 100)}%`;
}

export function fmtPctSigned(n: number | null | undefined, digits = 1): string {
  if (n == null || Number.isNaN(n)) return "—";
  const v = (n * 100).toFixed(digits);
  return n > 0 ? `+${v}%` : `${v}%`.replace("-", "−");
}

export function fmtNum(n: number | null | undefined, digits = 2): string {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toFixed(digits);
}

// Plain YYYY-MM-DD → "Jul 31" with no timezone drift.
export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}`;
}

// YYYY-MM-DD → "Jul 31 '26".
export function fmtDateYear(iso: string | null | undefined): string {
  if (!iso) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])} '${m[1].slice(2)}`;
}

// YYYY-MM-DD → "24 Jun 2026" (research-note masthead "as of" style).
export function fmtDateLong(iso: string | null | undefined): string {
  if (!iso) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}

export function fmtTimestamp(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Parse a 21-char OCC option symbol into a human label.
// NVDA260731C00220000 -> { ticker:"NVDA", human:"NVDA Jul 31 '26 220C", strike:220, cp:"C" }
export interface ParsedSymbol {
  ticker: string;
  human: string;
  strike: number;
  cp: "C" | "P";
  expiry: string; // YYYY-MM-DD
}

export function parseOcc(symbol: string | null | undefined): ParsedSymbol | null {
  if (!symbol) return null;
  const m = /^([A-Z]{1,6})\s*(\d{2})(\d{2})(\d{2})([CP])(\d{8})$/.exec(symbol.trim());
  if (!m) return null;
  const [, ticker, yy, mm, dd, cp, strikeRaw] = m;
  const strike = Number(strikeRaw) / 1000;
  const strikeStr = Number.isInteger(strike)
    ? String(strike)
    : strike.toFixed(2).replace(/0+$/, "");
  const expiry = `20${yy}-${mm}-${dd}`;
  return {
    ticker,
    cp: cp as "C" | "P",
    strike,
    expiry,
    human: `${ticker} ${MONTHS[Number(mm) - 1]} ${Number(dd)} '${yy} ${strikeStr}${cp}`,
  };
}

// Build a human contract label from parts when no OCC symbol is available.
export function contractLabel(
  ticker: string,
  strike: number | null,
  expiry: string | null,
  cp: "C" | "P" = "C"
): string {
  if (strike == null || !expiry) return "—";
  return `${ticker} ${fmtDateYear(expiry)} ${strike}${cp}`;
}
