"use client";

import { useState, useEffect, useMemo, use } from "react";
import Link from "next/link";
import { Header, Footer, TimeSeriesChart } from "@/components";
import { useOrganization, useFilters, useRequestToken } from "@/hooks";
import { OrganizationHeader } from "./OrganizationHeader";
import { ResearchAreas } from "./ResearchAreas";
import { CollaboratorsSection } from "./CollaboratorsSection";

export default function OrganizationPage({
  params,
}: {
  params: Promise<{ ror: string }>;
}) {
  const { ror } = use(params);
  const { organization, loading, error } = useOrganization(ror);

  const filters = useFilters();
  const { getHeaders, loading: tokenLoading } = useRequestToken();
  const [filteredCollabCounts, setFilteredCollabCounts] = useState<Record<string, number>>({});
  const [additionalCollaborators, setAdditionalCollaborators] = useState<{
    ror_id: string;
    name: string;
    country: string;
    collaboration_count: number;
  }[]>([]);
  const [filterQueryComplete, setFilterQueryComplete] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);

  useEffect(() => {
    async function fetchFilteredCollabCounts() {
      if (tokenLoading) {
        return;
      }

      if (!organization || (!filters.year && !filters.subject)) {
        setFilteredCollabCounts({});
        setAdditionalCollaborators([]);
        setFilterQueryComplete(false);
        return;
      }

      setFilterLoading(true);
      try {
        const filterParams: string[] = [`ror_ids:=\`${organization.ror_id}\``];
        if (filters.year) filterParams.push(`year:=${filters.year}`);
        if (filters.subject) filterParams.push(`subject_codes:=\`${filters.subject}\``);

        const params = new URLSearchParams({
          q: "*",
          filter_by: filterParams.join(" && "),
          facet_by: "ror_ids",
          max_facet_values: "500",
          per_page: "0",
        });

        const response = await fetch(`/api/search?${params}`, {
          headers: getHeaders(),
        });
        if (response.ok) {
          const data = await response.json();
          const rorFacet = data.facet_counts?.find(
            (f: { field_name: string }) => f.field_name === "ror_ids"
          );
          if (rorFacet) {
            const counts: Record<string, number> = {};
            const missingRorIds: string[] = [];
            const knownRorIds = new Set(
              organization.top_collaborators.flatMap(c => [
                c.ror_id,
                c.ror_id.replace("https://ror.org/", ""),
                c.ror_id.startsWith("https://") ? c.ror_id : `https://ror.org/${c.ror_id}`
              ])
            );

            rorFacet.counts.forEach((c: { value: string; count: number }) => {
              // Skip the current organization itself
              if (c.value !== organization.ror_id) {
                counts[c.value] = c.count;
                // Store both formats for matching
                const rorHash = c.value.replace("https://ror.org/", "");
                const fullRorId = c.value.startsWith("https://")
                  ? c.value
                  : `https://ror.org/${c.value}`;
                counts[rorHash] = c.count;
                counts[fullRorId] = c.count;

                if (!knownRorIds.has(c.value) && !knownRorIds.has(rorHash) && !knownRorIds.has(fullRorId)) {
                  missingRorIds.push(rorHash);
                }
              }
            });
            setFilteredCollabCounts(counts);

            const topMissing = missingRorIds.slice(0, 100);
            const additionalData = await Promise.all(
              topMissing.map(async (rorHash) => {
                try {
                  const res = await fetch(`/data/institutions/${rorHash}.json`);
                  if (res.ok) {
                    const org = await res.json();
                    return {
                      ror_id: org.ror_id,
                      name: org.name,
                      country: org.country,
                      collaboration_count: org.work_count,
                    };
                  }
                } catch {
                }
                return null;
              })
            );
            setAdditionalCollaborators(
              additionalData.filter((c): c is NonNullable<typeof c> => c !== null)
            );
          } else {
            setFilteredCollabCounts({});
            setAdditionalCollaborators([]);
          }
          setFilterQueryComplete(true);
        }
      } catch (error) {
        console.error("Failed to fetch filtered collaboration counts:", error);
      } finally {
        setFilterLoading(false);
      }
    }

    fetchFilteredCollabCounts();
  }, [organization, filters.year, filters.subject, tokenLoading, getHeaders]);

  const collaboratorCountries = useMemo(() => {
    if (!organization) return [];
    const hasApiFilters = filters.year || filters.subject;
    const allCollaborators = hasApiFilters
      ? [...organization.top_collaborators, ...additionalCollaborators]
      : organization.top_collaborators;
    const countries = [...new Set(allCollaborators.map(c => c.country))];
    return countries.sort();
  }, [organization, additionalCollaborators, filters.year, filters.subject]);

  const years = useMemo(() => {
    if (!organization) return [];
    return organization.time_series.map(t => t.year).sort((a, b) => b - a);
  }, [organization]);

  const filteredCollaborators = useMemo(() => {
    if (!organization) return [];

    const hasApiFilters = filters.year || filters.subject;
    let collaborators = hasApiFilters && filterQueryComplete
      ? [...organization.top_collaborators, ...additionalCollaborators]
      : [...organization.top_collaborators];

    if (filters.country) {
      collaborators = collaborators.filter(c => c.country === filters.country);
    }

    if (hasApiFilters && filterQueryComplete) {
      collaborators = collaborators
        .map(c => {
          const rorHash = c.ror_id.replace("https://ror.org/", "");
          const count = filteredCollabCounts[c.ror_id] ?? filteredCollabCounts[rorHash] ?? 0;
          return { ...c, filteredCount: count };
        })
        .filter(c => c.filteredCount > 0)
        .sort((a, b) => b.filteredCount - a.filteredCount);
    }

    return collaborators;
  }, [organization, filters.country, filters.year, filters.subject, filteredCollabCounts, filterQueryComplete, additionalCollaborators]);

  const buildCollabSearchUrl = (collabRorId: string, collabName: string) => {
    if (!organization) return "/search";
    const searchFilters: string[] = [
      `ror_ids:=\`${organization.ror_id}\``,
      `ror_ids:=\`${collabRorId}\``
    ];
    if (filters.year) searchFilters.push(`year:=${filters.year}`);
    if (filters.subject) searchFilters.push(`subject_codes:=\`${filters.subject}\``);

    // Build org_labels param with both org names
    const orgHash = organization.ror_id.replace("https://ror.org/", "");
    const collabHash = collabRorId.replace("https://ror.org/", "");
    const orgLabels = `${orgHash}:${organization.name},${collabHash}:${collabName}`;

    return `/search?filter_by=${encodeURIComponent(searchFilters.join(" && "))}&org_labels=${encodeURIComponent(orgLabels)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-12 w-96 bg-gray-100 dark:bg-neutral-800 rounded mb-4" />
            <div className="h-6 w-48 bg-gray-100 dark:bg-neutral-800 rounded" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-neutral-100 mb-2">
              Organization Not Found
            </h1>
            <p className="text-gray-500 dark:text-neutral-400 mb-4">{error}</p>
            <Link
              href="/stats"
              className="text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
            >
              View all organizations &rarr;
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const cityName = organization.locations?.[0]?.geonames_details?.name;

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12">
          <OrganizationHeader
            name={organization.name}
            country={organization.country}
            cityName={cityName}
            types={organization.types}
            rorId={organization.ror_id}
            workCount={organization.work_count}
            links={organization.links}
          />
          <ResearchAreas
            subjects={organization.top_subjects}
            rorId={organization.ror_id}
            orgName={organization.name}
          />
        </div>

        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-neutral-100 mb-4">
            Works Over Time
          </h2>
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 border border-gray-200 dark:border-neutral-700">
            <TimeSeriesChart data={organization.time_series} />
          </div>
        </section>

        {organization.top_collaborators.length > 0 && (
          <CollaboratorsSection
            collaborators={filteredCollaborators}
            loading={filterLoading}
            filters={filters}
            countries={collaboratorCountries}
            years={years}
            buildSearchUrl={buildCollabSearchUrl}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
