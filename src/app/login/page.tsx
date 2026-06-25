"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { post } from "@/lib/api";
import { BRAND } from "@/lib/brand";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await post("/auth/login", { password });
      router.push("/");
    } catch {
      setError("Incorrect access code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-lg border border-line bg-surface exhibit p-8">
          <div className="flex items-center gap-2.5 mb-1">
            <svg
              className="w-5 h-5 text-accent shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="8.6" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7.6 12h8.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="font-serif text-[22px] text-ink tracking-[-0.01em]">{BRAND.name}</span>
          </div>
          <p className="text-sm text-muted mb-7">{BRAND.tagline}</p>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Access code"
                // biome-ignore lint/a11y/noAutofocus: single-field gate, focus is expected
                autoFocus
                className="w-full px-3.5 py-2.5 pr-16 rounded-md bg-surface border border-line-strong text-ink placeholder-faint focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-muted transition-colors text-[11px] font-semibold"
                tabIndex={-1}
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
            {error && (
              <div className="text-sm text-risk bg-risk-soft border border-risk/20 rounded-md px-3 py-2">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-2.5 rounded-md bg-accent text-white font-semibold text-sm hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {loading ? "Signing in…" : "Enter"}
            </button>
          </form>
        </div>
        <p className="text-center text-faint text-[11px] mt-5">
          Private · analyze-only · not investment advice
        </p>
      </div>
    </div>
  );
}
