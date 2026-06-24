import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import { BRAND } from "@/lib/brand";
import "./globals.css";
import { Providers } from "./providers";

// Self-hosted (next/font downloads + serves these — no runtime request to Google,
// which also keeps a distributed link from leaking viewers' IPs to a third party).
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description:
    "A covered-call income desk: monthly call recommendations, net of tax, analyze-only.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
