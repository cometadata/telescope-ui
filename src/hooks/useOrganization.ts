"use client";

import { useState, useEffect } from "react";
import type { OrganizationData } from "@/types";

interface UseOrganizationResult {
  organization: OrganizationData | null;
  loading: boolean;
  error: string | null;
}

function parseTypesenseResponse(data: {
  ror_id: string;
  name: string;
  country: string;
  country_code: string;
  types: string[];
  work_count: number;
  time_series: string;
  top_collaborators: string;
  top_subjects: string;
  links: string;
  locations: string;
}): OrganizationData {
  return {
    ror_id: data.ror_id,
    name: data.name,
    country: data.country,
    country_code: data.country_code,
    types: data.types,
    work_count: data.work_count,
    time_series: data.time_series ? JSON.parse(data.time_series) : [],
    top_collaborators: data.top_collaborators ? JSON.parse(data.top_collaborators) : [],
    top_subjects: data.top_subjects ? JSON.parse(data.top_subjects) : [],
    links: data.links ? JSON.parse(data.links) : [],
    locations: data.locations ? JSON.parse(data.locations) : [],
  };
}

export function useOrganization(rorHash: string): UseOrganizationResult {
  const [organization, setOrganization] = useState<OrganizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrganization() {
      try {
        const response = await fetch(`/api/institutions/${rorHash}`);
        if (!response.ok) {
          throw new Error("Organization not found");
        }
        const data = await response.json();
        setOrganization(parseTypesenseResponse(data));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load organization");
      } finally {
        setLoading(false);
      }
    }
    fetchOrganization();
  }, [rorHash]);

  return { organization, loading, error };
}
