"use client";

import { useState, useEffect } from "react";
import type { GlobalStats } from "@/types";

interface UseGlobalStatsResult {
  stats: GlobalStats | null;
  loading: boolean;
  error: string | null;
}

export function useGlobalStats(): UseGlobalStatsResult {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/stats/global");
        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }
        setStats(await response.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stats");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return { stats, loading, error };
}
