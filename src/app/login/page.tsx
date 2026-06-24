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
      setError("Invalid password. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e14] px-4 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(28,37,49,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(28,37,49,0.5) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="w-full max-w-sm relative z-10">
        <div className="rounded-2xl border border-[#1c2531] bg-gradient-to-br from-[#131a24] to-[#0a0e14] p-8 shadow-2xl shadow-black/50">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white tracking-tight">{BRAND.name}</h1>
            <p className="text-sm text-[#8b97a6] mt-1.5">{BRAND.tagline}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Access password"
                className="w-full px-4 py-3 pr-16 rounded-xl bg-[#0a0e14] border border-[#1c2531] text-white placeholder-[#5b6573] focus:outline-none focus:border-[#3b82f6]/50 focus:ring-1 focus:ring-[#3b82f6]/30 transition-colors text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5b6573] hover:text-[#8b97a6] transition-colors text-xs font-semibold"
                tabIndex={-1}
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
            {error && (
              <div className="text-sm text-[#f87171] bg-[#f87171]/10 border border-[#f87171]/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 rounded-xl bg-[#3b82f6] text-white font-semibold text-sm hover:bg-[#2563eb] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Signing in…" : "Enter"}
            </button>
          </form>
        </div>
        <p className="text-center text-[#5b6573] text-xs mt-5">
          Private · analyze-only · not investment advice
        </p>
      </div>
    </div>
  );
}
