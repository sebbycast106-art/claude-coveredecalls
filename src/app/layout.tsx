import type { Metadata } from "next";
import { Inter, Newsreader, Roboto_Mono } from "next/font/google";
import { BRAND } from "@/lib/brand";
import "./globals.css";
import { Providers } from "./providers";

// Inter — body + all data/metrics (tabular figures). Self-hosted.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Newsreader — light editorial serif for masthead, section + action titles, hero
// number. The single highest-leverage "a professional made this" move.
const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

// Roboto Mono — demoted to scan-table numeric cells + OCC contract symbols only.
const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description:
    "A covered-call income analysis: monthly call recommendations, net of tax, analyze-only.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable} ${robotoMono.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
