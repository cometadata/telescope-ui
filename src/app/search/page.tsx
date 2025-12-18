"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Header,
  Footer,
  FieldedSearchBar,
  WorkCard,
  FacetFilters,
  FloatingFilterButton,
  MobileFilterSheet,
  Pagination,
  FilterSelect,
} from "@/components";
import SearchLoading from "./loading";
import type { SearchResults } from "@/types";
import { useRequestToken } from "@/hooks/useRequestToken";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getHeaders, error: tokenError, loading: tokenLoading } = useRequestToken();

  const query = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("per_page") || "20");
  const filterBy = searchParams.get("filter_by") || "";
  const orgLabelsParam = searchParams.get("org_labels") || "";

  // Parse org_labels param (format: "rorHash1:Name1,rorHash2:Name2")
  // Memoized to prevent infinite re-renders in FieldedSearchBar
  const orgLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    if (orgLabelsParam) {
      for (const pair of orgLabelsParam.split(",")) {
        const colonIndex = pair.indexOf(":");
        if (colonIndex > 0) {
          const rorHash = pair.slice(0, colonIndex);
          const name = pair.slice(colonIndex + 1);
          if (rorHash && name) {
            labels[rorHash] = name;
            // Also map the full ROR URL
            labels[`https://ror.org/${rorHash}`] = name;
          }
        }
      }
    }
    return labels;
  }, [orgLabelsParam]);

  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = useCallback(async () => {
    if (tokenLoading || tokenError) {
      return;
    }

    if (!query && !filterBy) {
      setResults(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: query || "*",
        page: page.toString(),
        per_page: perPage.toString(),
      });

      if (filterBy) {
        params.set("filter_by", filterBy);
      }

      const response = await fetch(`/api/search?${params}`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Search failed");
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }, [query, page, perPage, filterBy, getHeaders, tokenLoading, tokenError]);

  useEffect(() => {
    search();
  }, [search]);

  const handleFilterChange = useCallback((newFilter: string) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (newFilter) params.set("filter_by", newFilter);
    if (perPage !== 20) params.set("per_page", perPage.toString());
    params.set("page", "1");
    router.push(`/search?${params.toString()}`);
  }, [query, perPage, router]);

  const handlePageChange = useCallback((newPage: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (filterBy) params.set("filter_by", filterBy);
    if (perPage !== 20) params.set("per_page", perPage.toString());
    params.set("page", newPage.toString());
    router.push(`/search?${params.toString()}`);
  }, [query, filterBy, perPage, router]);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (filterBy) params.set("filter_by", filterBy);
    if (newPerPage !== 20) params.set("per_page", newPerPage.toString());
    params.set("page", "1");
    router.push(`/search?${params.toString()}`);
  }, [query, filterBy, router]);

  const totalPages = results ? Math.ceil(results.found / perPage) : 0;

  // Handle token error - must be after all hooks
  if (tokenError) {
    return (
      <div className="min-h-screen bg-white">
        <Header activeTab="search" />
        <main className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-600">
            Unable to initialize search. Please refresh the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-black text-white rounded-lg"
          >
            Refresh
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Header activeTab="search" />

      <div className="border-b border-gray-200 dark:border-neutral-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-3xl mx-auto">
            <FieldedSearchBar initialQuery={query} initialFilters={filterBy} initialOrgLabels={orgLabels} />
          </div>
        </div>
      </div>

      {!loading && !query && !filterBy && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-8">
            <h4 className="text-sm font-medium text-gray-700 dark:text-neutral-300 mb-3 text-center">
              Try an example search
            </h4>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { label: "University of California Berkeley", query: "", filter: "ror_ids:=`https://ror.org/01an7q238`" },
                { label: "Computer Vision", query: "", filter: "subject_codes:=`cs.CV`" },
                { label: "2025", query: "", filter: "year:=2025" },
                { label: "France", query: "", filter: "countries:=`France`" },
              ].map((example) => (
                <button
                  key={example.label}
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (example.query) params.set("q", example.query);
                    if (example.filter) params.set("filter_by", example.filter);
                    router.push(`/search?${params.toString()}`);
                  }}
                  className="px-4 py-2 text-sm bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300 rounded-full border border-gray-200 dark:border-neutral-700 transition-colors"
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border border-gray-200 dark:border-neutral-700 rounded-lg p-5 max-w-md mx-auto">
            <h4 className="text-sm font-medium text-gray-900 dark:text-neutral-100 mb-3">
              Search tips
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-600 dark:text-neutral-400">
              <li className="flex items-start gap-3">
                <code className="px-2 py-0.5 bg-gray-100 dark:bg-neutral-800 rounded text-gray-700 dark:text-neutral-300 font-mono text-xs shrink-0">org:</code>
                <span>Filter by organization (e.g., <span className="text-gray-900 dark:text-neutral-100">org:MIT</span>)</span>
              </li>
              <li className="flex items-start gap-3">
                <code className="px-2 py-0.5 bg-gray-100 dark:bg-neutral-800 rounded text-gray-700 dark:text-neutral-300 font-mono text-xs shrink-0">subject:</code>
                <span>Filter by subject (e.g., <span className="text-gray-900 dark:text-neutral-100">subject:cs.AI</span>)</span>
              </li>
              <li className="flex items-start gap-3">
                <code className="px-2 py-0.5 bg-gray-100 dark:bg-neutral-800 rounded text-gray-700 dark:text-neutral-300 font-mono text-xs shrink-0">year:</code>
                <span>Filter by year (e.g., <span className="text-gray-900 dark:text-neutral-100">year:2024</span>)</span>
              </li>
              <li className="flex items-start gap-3">
                <code className="px-2 py-0.5 bg-gray-100 dark:bg-neutral-800 rounded text-gray-700 dark:text-neutral-300 font-mono text-xs shrink-0">country:</code>
                <span>Filter by country (e.g., <span className="text-gray-900 dark:text-neutral-100">country:Germany</span>)</span>
              </li>
            </ul>
          </div>
        </main>
      )}

      {(loading || query || filterBy) && (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FacetFilters
              facets={results?.facet_counts || []}
              currentFilter={filterBy}
              onFilterChange={handleFilterChange}
            />
          </aside>

          <div className="flex-1">
            {results && (
              <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-600 dark:text-neutral-400">
                  Found <span className="font-semibold">{results.found.toLocaleString()}</span> works
                  {query && (
                    <>
                      {" "}for <span className="font-semibold">&quot;{query}&quot;</span>
                    </>
                  )}
                </p>

                <div className="flex items-center gap-4 text-sm">
                  <FilterSelect
                    label="Show"
                    value={perPage.toString()}
                    onChange={(v) => handlePerPageChange(parseInt(v))}
                    options={[
                      { value: "10", label: "10" },
                      { value: "20", label: "20" },
                      { value: "50", label: "50" },
                      { value: "100", label: "100" },
                    ]}
                    placeholder="20"
                  />

                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="px-2 py-1 rounded bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-neutral-700"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= totalPages}
                        className="px-2 py-1 rounded bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-neutral-700"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(loading || (tokenLoading && (query || filterBy))) && (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-40 bg-gray-100 dark:bg-neutral-800 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
                {error}
              </div>
            )}

            {!loading && !error && query && results?.found === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-neutral-400">No works found for &quot;{query}&quot;</p>
                <p className="text-sm text-gray-400 dark:text-neutral-500 mt-2">
                  Try a different search term or adjust your filters
                </p>
              </div>
            )}

            {!loading && results && results.hits.length > 0 && (
              <div className="space-y-4 animate-fade-in-stagger">
                {results.hits.map((hit) => (
                  <WorkCard key={hit.document.id} work={hit.document} />
                ))}
              </div>
            )}

            {results && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className="mt-8 pb-20 lg:pb-0"
              />
            )}

          </div>
        </div>
      </main>
      )}

      {/* Mobile only */}
      {(query || filterBy) && (
        <FloatingFilterButton
          onClick={() => setFiltersOpen(true)}
          activeFilterCount={filterBy ? 1 : 0}
        />
      )}

      <MobileFilterSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
      >
        <FacetFilters
          facets={results?.facet_counts || []}
          currentFilter={filterBy}
          onFilterChange={(newFilter) => {
            handleFilterChange(newFilter);
            setFiltersOpen(false);
          }}
        />
      </MobileFilterSheet>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchContent />
    </Suspense>
  );
}
