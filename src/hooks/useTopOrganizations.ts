"use client";

import { useState, useEffect } from "react";
import type { OrganizationSummary } from "@/types";

interface UseTopOrganizationsResult {
  organizations: OrganizationSummary[];
  loading: boolean;
  error: string | null;
}

export function useTopOrganizations(limit?: number): UseTopOrganizationsResult {
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const response = await fetch("/api/stats/top-institutions");
        if (!response.ok) {
          throw new Error("Failed to fetch organizations");
        }
        const data = await response.json();
        setOrganizations(limit ? data.slice(0, limit) : data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load organizations");
      } finally {
        setLoading(false);
      }
    }
    fetchOrganizations();
  }, [limit]);

  return { organizations, loading, error };
}
