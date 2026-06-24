"use client";
import { useQuery } from "@tanstack/react-query";
import type { CoveredCallsPayload } from "@/lib/contract";

async function fetchCoveredCalls(): Promise<CoveredCallsPayload> {
  const res = await fetch("/api/covered-calls");
  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export const coveredCallsKey = ["covered-calls"] as const;

export function useCoveredCalls() {
  return useQuery({
    queryKey: coveredCallsKey,
    queryFn: fetchCoveredCalls,
    refetchInterval: 300_000,
  });
}
