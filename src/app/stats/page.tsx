"use client";

import { useState, useEffect, useMemo } from "react";
import { Header, Footer, TimeSeriesChart } from "@/components";
import { useFilters } from "@/hooks";
import { ARXIV_SUBJECTS } from "@/lib/subjects";
import type { GlobalStats, OrganizationSummary, YearData, CountryData } from "@/types";
import { StatsOverviewCards } from "./StatsOverviewCards";
import { TopCountriesChart } from "./TopCountriesChart";
import { OrganizationsSection } from "./OrganizationsSection";

const ITEMS_PER_PAGE = 20;

export default function StatsPage() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [topOrganizations, setTopOrganizations] = useState<OrganizationSummary[]>([]);
  const [yearData, setYearData] = useState<YearData[]>([]);
  const [countryData, setCountryData] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);

  const filters = useFilters();
  const [filteredCounts, setFilteredCounts] = useState<Record<string, number>>({});
  const [additionalOrganizations, setAdditionalOrganizations] = useState<OrganizationSummary[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, institutionsRes, yearRes, countryRes] = await Promise.all([
          fetch("/api/stats/global"),
          fetch("/api/stats/top-institutions"),
          fetch("/api/stats/by-year"),
          fetch("/api/stats/by-country"),
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (institutionsRes.ok) {
          // Top institutions endpoint returns array directly
          setTopOrganizations(await institutionsRes.json());
        }
        if (yearRes.ok) setYearData(await yearRes.json());
        if (countryRes.ok) setCountryData(await countryRes.json());
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    async function fetchFilteredCounts() {
      if (!filters.year && !filters.subject && !filters.country) {
        setFilteredCounts({});
        setAdditionalOrganizations([]);
        return;
      }

      try {
        const filterParams: string[] = [];
        if (filters.year) filterParams.push(`year:=${filters.year}`);
        if (filters.subject) filterParams.push(`subject_codes:=\`${filters.subject}\``);
        if (filters.country) filterParams.push(`countries:=\`${filters.country}\``);

        const params = new URLSearchParams({
          q: "*",
          filter_by: filterParams.join(" && "),
          facet_by: "ror_ids",
          max_facet_values: "1000",
          per_page: "0",
        });

        const response = await fetch(`/api/search?${params}`);
        if (response.ok) {
          const data = await response.json();
          const rorFacet = data.facet_counts?.find(
            (f: { field_name: string }) => f.field_name === "ror_ids"
          );
          if (rorFacet) {
            const counts: Record<string, number> = {};
            const missingRorIds: string[] = [];

            // Build a set of known ROR IDs for quick lookup
            const knownRorIds = new Set(
              topOrganizations.flatMap(org => [
                org.ror_id,
                org.ror_id.replace("https://ror.org/", ""),
                org.ror_id.startsWith("https://") ? org.ror_id : `https://ror.org/${org.ror_id}`
              ])
            );

            rorFacet.counts.forEach((c: { value: string; count: number }) => {
              // Store both formats for matching
              counts[c.value] = c.count;
              const rorHash = c.value.startsWith("https://ror.org/")
                ? c.value.replace("https://ror.org/", "")
                : c.value;
              const fullRorId = c.value.startsWith("https://")
                ? c.value
                : `https://ror.org/${c.value}`;

              counts[rorHash] = c.count;
              counts[fullRorId] = c.count;

              // Track ROR IDs not in topOrganizations
              if (!knownRorIds.has(c.value) && !knownRorIds.has(rorHash) && !knownRorIds.has(fullRorId)) {
                missingRorIds.push(rorHash);
              }
            });
            setFilteredCounts(counts);

            // Fetch metadata for missing organizations (limit to top 100 to avoid too many requests)
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
                      city: org.locations?.[0]?.geonames_details?.name,
                      country: org.country,
                      work_count: org.work_count,
                    } as OrganizationSummary;
                  }
                } catch {
                  // Organization file doesn't exist
                }
                return null;
              })
            );
            setAdditionalOrganizations(additionalData.filter((org): org is OrganizationSummary => org !== null));
          }
        }
      } catch (error) {
        console.error("Failed to fetch filtered counts:", error);
      }
    }

    fetchFilteredCounts();
  }, [filters.year, filters.subject, filters.country, topOrganizations]);

  const countries = useMemo(() => {
    const hasFilters = filters.year || filters.subject;
    const organizations = hasFilters
      ? [...topOrganizations, ...additionalOrganizations]
      : topOrganizations;

    const countriesWithOrgs = new Set(organizations.map((org) => org.country));
    return Array.from(countriesWithOrgs).sort();
  }, [topOrganizations, additionalOrganizations, filters.year, filters.subject]);

  const filteredOrganizations = useMemo(() => {
    const hasFilters = filters.year || filters.subject || filters.country;

    // When filters are applied, merge topOrganizations with additionalOrganizations
    let organizations = hasFilters
      ? [...topOrganizations, ...additionalOrganizations]
      : topOrganizations;

    // Filter by country (only needed for topOrganizations since additionalOrganizations are already filtered)
    if (filters.country) {
      organizations = organizations.filter((org) => org.country === filters.country);
    }

    // When filters are applied, filter out zero-count and sort by filtered counts
    if (hasFilters && Object.keys(filteredCounts).length > 0) {
      organizations = organizations
        .map((org) => {
          const fullRorId = org.ror_id.startsWith("https://") ? org.ror_id : `https://ror.org/${org.ror_id}`;
          const rorHash = org.ror_id.replace("https://ror.org/", "");
          const count = filteredCounts[fullRorId] ?? filteredCounts[rorHash] ?? 0;
          return { ...org, filteredCount: count };
        })
        .filter((org) => org.filteredCount > 0)
        .sort((a, b) => b.filteredCount - a.filteredCount);
    }

    return organizations;
  }, [topOrganizations, additionalOrganizations, filters.country, filters.year, filters.subject, filteredCounts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.country, filters.year, filters.subject]);

  // Clear selected country if it's no longer in the available countries list
  useEffect(() => {
    if (filters.country && countries.length > 0 && !countries.includes(filters.country)) {
      filters.setCountry("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countries, filters.country, filters.setCountry]);

  const totalPages = Math.ceil(filteredOrganizations.length / ITEMS_PER_PAGE);
  const paginatedOrganizations = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrganizations.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrganizations, currentPage]);

  const years = useMemo(() => {
    return yearData.map((y) => y.year).sort((a, b) => b - a);
  }, [yearData]);

  const allSubjects = useMemo(() => {
    return Object.entries(ARXIV_SUBJECTS);
  }, []);

  const buildSearchUrl = (rorId: string) => {
    const searchFilters: string[] = [`ror_ids:=\`${rorId}\``];
    if (filters.year) searchFilters.push(`year:=${filters.year}`);
    if (filters.subject) searchFilters.push(`subject_codes:=\`${filters.subject}\``);
    return `/search?filter_by=${encodeURIComponent(searchFilters.join(" && "))}`;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Header activeTab="statistics" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsOverviewCards stats={stats} loading={loading} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 border border-gray-200 dark:border-neutral-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-1">
              Records Over Time
              <span className="text-sm font-normal text-gray-500 dark:text-neutral-400 ml-2">by submission year</span>
            </h3>
            {loading ? (
              <div className="h-80 animate-pulse bg-gray-100 dark:bg-neutral-800 rounded" />
            ) : (
              <div className="animate-fade-in">
                <TimeSeriesChart data={yearData} height={320} />
              </div>
            )}
          </div>

          <TopCountriesChart data={countryData} loading={loading} />
        </div>

        <OrganizationsSection
          organizations={paginatedOrganizations}
          totalCount={filteredOrganizations.length}
          loading={loading}
          filters={filters}
          countries={countries}
          years={years}
          subjects={allSubjects}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          buildSearchUrl={buildSearchUrl}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </main>

      <Footer />
    </div>
  );
}
