"use client";

import { useState, useEffect, useCallback, useRef, Suspense, KeyboardEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OrganizationCard } from "@/components/OrganizationCard";
import { FacetFilters } from "@/components/FacetFilters";
import { ARXIV_SUBJECTS } from "@/lib/subjects";
import OrganizationsLoading from "./loading";

interface InstitutionHit {
  document: {
    id: string;
    ror_id: string;
    name: string;
    acronyms: string[];
    aliases: string[];
    labels: string[];
    country: string;
    country_code: string;
    city: string;
    types: string[];
    work_count: number;
  };
}

interface FacetCount {
  value: string;
  count: number;
}

interface SearchResults {
  found: number;
  hits: InstitutionHit[];
  facet_counts?: {
    field_name: string;
    counts: FacetCount[];
  }[];
  page: number;
}

interface SelectedField {
  type: "type" | "country" | "subject";
  value: string;
  label: string;
}

interface Suggestion {
  type: "type" | "country" | "subject";
  value: string;
  label: string;
  count?: number;
}

// Field configuration
const FIELD_CONFIG = {
  type: { filterField: "types", placeholder: "Organization type" },
  country: { filterField: "country", placeholder: "Country name" },
  subject: { filterField: "subject_codes", placeholder: "Subject area" },
} as const;

type FieldType = keyof typeof FIELD_CONFIG;

// Organization types
const ORG_TYPES: Suggestion[] = [
  { type: "type", value: "Education", label: "Education" },
  { type: "type", value: "Company", label: "Company" },
  { type: "type", value: "Healthcare", label: "Healthcare" },
  { type: "type", value: "Government", label: "Government" },
  { type: "type", value: "Nonprofit", label: "Nonprofit" },
  { type: "type", value: "Facility", label: "Facility" },
  { type: "type", value: "Archive", label: "Archive" },
  { type: "type", value: "Other", label: "Other" },
];

// Subject codes from arXiv
const SUBJECT_LIST: Suggestion[] = Object.entries(ARXIV_SUBJECTS).map(([code, name]) => ({
  type: "subject" as const,
  value: code,
  label: `${name} (${code})`,
}));

// Parse filter_by string into selected fields
function parseInitialFilters(filterBy: string): SelectedField[] {
  if (!filterBy) return [];

  const fields: SelectedField[] = [];
  const parts = filterBy.split(" && ");

  for (const part of parts) {
    const match = part.match(/^(\w+):=?\[?([^\]]+)\]?$/);
    if (match) {
      const [, field, valuesStr] = match;
      const values = valuesStr.split(",").map((v) => v.replace(/`/g, "").trim()).filter(Boolean);

      for (const value of values) {
        if (field === "types") {
          fields.push({ type: "type", value, label: value });
        } else if (field === "country") {
          fields.push({ type: "country", value, label: value });
        } else if (field === "subject_codes") {
          const subjectName = ARXIV_SUBJECTS[value];
          fields.push({ type: "subject", value, label: subjectName ? `${subjectName} (${value})` : value });
        }
      }
    }
  }

  return fields;
}

function OrganizationsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("per_page") || "20");
  const filterBy = searchParams.get("filter_by") || "";

  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Search bar state
  const [textQuery, setTextQuery] = useState(query);
  const [selectedFields, setSelectedFields] = useState<SelectedField[]>(() => parseInitialFilters(filterBy));
  const [activeField, setActiveField] = useState<FieldType | null>(null);
  const [fieldQuery, setFieldQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [countryList, setCountryList] = useState<Suggestion[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load country data
  useEffect(() => {
    async function loadCountries() {
      try {
        const response = await fetch("/data/stats/by-country.json");
        if (response.ok) {
          const countries: { country: string; work_count: number }[] = await response.json();
          setCountryList(
            countries.map((c) => ({
              type: "country" as const,
              value: c.country,
              label: c.country,
              count: c.work_count,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to load countries:", error);
      }
    }
    loadCountries();
  }, []);

  // Sync state with URL changes
  useEffect(() => {
    setTextQuery(query);
    setSelectedFields(parseInitialFilters(filterBy));
  }, [query, filterBy]);

  const search = useCallback(async () => {
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

      const response = await fetch(`/api/organizations?${params}`);

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }, [query, page, perPage, filterBy]);

  useEffect(() => {
    search();
  }, [search]);

  // Filter type suggestions
  const filterTypeSuggestions = useCallback((q: string) => {
    if (!q) {
      setSuggestions(ORG_TYPES);
      return;
    }
    const lowerQuery = q.toLowerCase();
    setSuggestions(ORG_TYPES.filter((t) => t.label.toLowerCase().includes(lowerQuery)));
  }, []);

  // Filter country suggestions
  const filterCountrySuggestions = useCallback((q: string) => {
    if (!q) {
      setSuggestions(countryList.slice(0, 10));
      return;
    }
    const lowerQuery = q.toLowerCase();
    setSuggestions(countryList.filter((c) => c.label.toLowerCase().includes(lowerQuery)).slice(0, 10));
  }, [countryList]);

  // Filter subject suggestions
  const filterSubjectSuggestions = useCallback((q: string) => {
    if (!q) {
      setSuggestions(SUBJECT_LIST.slice(0, 10));
      return;
    }
    const lowerQuery = q.toLowerCase();
    setSuggestions(SUBJECT_LIST.filter((s) => s.label.toLowerCase().includes(lowerQuery)).slice(0, 10));
  }, []);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Check for field prefixes
    const fieldPatterns: { pattern: RegExp; field: FieldType; filter: (q: string) => void }[] = [
      { pattern: /\btype:$/i, field: "type", filter: filterTypeSuggestions },
      { pattern: /\bcountry:$/i, field: "country", filter: filterCountrySuggestions },
      { pattern: /\bsubject:$/i, field: "subject", filter: filterSubjectSuggestions },
    ];

    for (const { pattern, field, filter } of fieldPatterns) {
      if (pattern.test(value)) {
        setActiveField(field);
        setFieldQuery("");
        setTextQuery(value.replace(pattern, "").trim());
        setShowSuggestions(true);
        filter("");
        return;
      }
    }

    if (activeField) {
      setFieldQuery(value);
      setSelectedIndex(-1);
      if (activeField === "type") {
        filterTypeSuggestions(value);
      } else if (activeField === "country") {
        filterCountrySuggestions(value);
      } else if (activeField === "subject") {
        filterSubjectSuggestions(value);
      }
    } else {
      setTextQuery(value);
    }
  };

  // Select a suggestion
  const selectSuggestion = (suggestion: Suggestion) => {
    const newField: SelectedField = {
      type: suggestion.type,
      value: suggestion.value,
      label: suggestion.label,
    };

    setSelectedFields((prev) => [...prev, newField]);
    setActiveField(null);
    setFieldQuery("");
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);

    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // Remove a field chip
  const removeField = (index: number) => {
    setSelectedFields((prev) => prev.filter((_, i) => i !== index));
  };

  // Cancel field input
  const cancelFieldInput = () => {
    setActiveField(null);
    setFieldQuery("");
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      if (activeField) {
        e.preventDefault();
        cancelFieldInput();
        return;
      }
      if (showSuggestions) {
        setShowSuggestions(false);
        return;
      }
    }

    if (e.key === "Backspace") {
      if (activeField && !fieldQuery) {
        e.preventDefault();
        cancelFieldInput();
        return;
      }
      if (!activeField && !textQuery && selectedFields.length > 0) {
        e.preventDefault();
        removeField(selectedFields.length - 1);
        return;
      }
    }

    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          selectSuggestion(suggestions[selectedIndex]);
        } else if (suggestions.length > 0) {
          selectSuggestion(suggestions[0]);
        }
        break;
      case "Tab":
        if (suggestions.length > 0) {
          e.preventDefault();
          selectSuggestion(suggestions[selectedIndex >= 0 ? selectedIndex : 0]);
        }
        break;
    }
  };

  // Build URL and navigate
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const params = new URLSearchParams();

    if (textQuery.trim()) {
      params.set("q", textQuery.trim());
    }

    // Build filter_by from selected fields
    const filterParts: string[] = [];
    const fieldsByType: Record<string, string[]> = {};

    for (const field of selectedFields) {
      const filterField = FIELD_CONFIG[field.type].filterField;
      if (!fieldsByType[filterField]) {
        fieldsByType[filterField] = [];
      }
      fieldsByType[filterField].push(field.value);
    }

    for (const [filterField, values] of Object.entries(fieldsByType)) {
      if (values.length === 1) {
        filterParts.push(`${filterField}:=\`${values[0]}\``);
      } else if (values.length > 1) {
        filterParts.push(`${filterField}:=[${values.map((v) => `\`${v}\``).join(",")}]`);
      }
    }

    if (filterParts.length > 0) {
      params.set("filter_by", filterParts.join(" && "));
    }

    params.set("page", "1");
    router.push(`/organizations?${params.toString()}`);
  };

  const handleFilterChange = (newFilter: string) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (newFilter) params.set("filter_by", newFilter);
    params.set("page", "1");
    router.push(`/organizations?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (filterBy) params.set("filter_by", filterBy);
    if (perPage !== 20) params.set("per_page", perPage.toString());
    params.set("page", newPage.toString());
    router.push(`/organizations?${params.toString()}`);
  };

  const handlePerPageChange = (newPerPage: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (filterBy) params.set("filter_by", filterBy);
    if (newPerPage !== 20) params.set("per_page", newPerPage.toString());
    params.set("page", "1");
    router.push(`/organizations?${params.toString()}`);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        if (activeField) {
          cancelFieldInput();
        }
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeField]);

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const items = suggestionsRef.current.querySelectorAll("[data-suggestion]");
      items[selectedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const totalPages = results ? Math.ceil(results.found / perPage) : 0;

  const inputValue = activeField ? fieldQuery : textQuery;
  const inputPlaceholder = activeField
    ? `Search ${FIELD_CONFIG[activeField].placeholder}...`
    : selectedFields.length > 0
    ? "Add more filters or search text..."
    : "Search organizations... Type type:, country:, or subject: for filters";

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Header activeTab="organizations" />

      {/* Search Section */}
      <div className="border-b border-gray-200 dark:border-neutral-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                {/* Input area with chips */}
                <div className="flex-1 flex flex-wrap items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 focus-within:ring-2 focus-within:ring-gray-400 dark:focus-within:ring-neutral-500 focus-within:border-transparent max-w-full">
                  {/* Selected field chips */}
                  {selectedFields.map((field, index) => (
                    <span
                      key={`${field.type}-${field.value}-${index}`}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm bg-gray-100 dark:bg-neutral-700 text-gray-800 dark:text-neutral-200"
                    >
                      <span className="whitespace-nowrap" title={field.label}>
                        {field.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeField(index)}
                        className="ml-0.5 hover:opacity-70"
                        aria-label={`Remove ${field.label}`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </span>
                  ))}

                  {/* Active field indicator */}
                  {activeField && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-gray-100 dark:bg-neutral-700 text-gray-800 dark:text-neutral-200">
                      <span className="font-medium">{activeField}:</span>
                    </span>
                  )}

                  {/* Input field */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                      if (activeField) {
                        setShowSuggestions(true);
                        if (activeField === "type") {
                          filterTypeSuggestions(fieldQuery);
                        } else if (activeField === "country") {
                          filterCountrySuggestions(fieldQuery);
                        } else if (activeField === "subject") {
                          filterSubjectSuggestions(fieldQuery);
                        }
                      }
                    }}
                    placeholder={inputPlaceholder}
                    className="flex-1 min-w-[80px] sm:min-w-[150px] px-1 py-1 text-base bg-transparent text-gray-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none"
                  />
                </div>

                {/* Search button */}
                <button
                  type="submit"
                  className="flex-shrink-0 p-3 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-neutral-200 text-white dark:text-black rounded-lg transition-colors"
                  aria-label="Search"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </button>
              </form>

              {/* Autocomplete dropdown */}
              {showSuggestions && (activeField || suggestions.length > 0) && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg max-h-72 overflow-y-auto"
                >
                  {suggestions.length === 0 && activeField && fieldQuery.length >= 1 && (
                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-neutral-400">
                      No matches found for &quot;{fieldQuery}&quot;
                    </div>
                  )}

                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.type}-${suggestion.value}`}
                      data-suggestion
                      onClick={() => selectSuggestion(suggestion)}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-neutral-700 flex items-center justify-between gap-2 ${
                        index === selectedIndex ? "bg-gray-100 dark:bg-neutral-700" : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-neutral-100 truncate">{suggestion.label}</div>
                      </div>
                      {suggestion.count !== undefined && (
                        <span className="flex-shrink-0 text-xs text-gray-400 dark:text-neutral-500 bg-gray-100 dark:bg-neutral-600 px-2 py-0.5 rounded">
                          {suggestion.count.toLocaleString()} works
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Field hints */}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-neutral-400">
              <span>Filters:</span>
              <button
                type="button"
                onClick={() => {
                  setActiveField("type");
                  setFieldQuery("");
                  setShowSuggestions(true);
                  filterTypeSuggestions("");
                  inputRef.current?.focus();
                }}
                className="px-1.5 py-0.5 bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600 rounded text-gray-600 dark:text-neutral-300 transition-colors"
              >
                type:
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveField("country");
                  setFieldQuery("");
                  setShowSuggestions(true);
                  filterCountrySuggestions("");
                  inputRef.current?.focus();
                }}
                className="px-1.5 py-0.5 bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600 rounded text-gray-600 dark:text-neutral-300 transition-colors"
              >
                country:
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveField("subject");
                  setFieldQuery("");
                  setShowSuggestions(true);
                  filterSubjectSuggestions("");
                  inputRef.current?.focus();
                }}
                className="px-1.5 py-0.5 bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600 rounded text-gray-600 dark:text-neutral-300 transition-colors"
              >
                subject:
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 lg:gap-8">
          {/* Facet Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FacetFilters
              facets={results?.facet_counts || []}
              currentFilter={filterBy}
              onFilterChange={handleFilterChange}
            />
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Results Header */}
            {results && (
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <p className="text-gray-600 dark:text-neutral-400">
                  Found <span className="font-semibold">{results.found.toLocaleString()}</span> organizations
                  {query && (
                    <>
                      {" "}for <span className="font-semibold">&quot;{query}&quot;</span>
                    </>
                  )}
                </p>

                {/* Per page & Pagination */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
                  {/* Per page selector */}
                  <div className="flex items-center gap-2">
                    <label htmlFor="per-page" className="text-gray-600 dark:text-neutral-400">Show</label>
                    <select
                      id="per-page"
                      value={perPage}
                      onChange={(e) => handlePerPageChange(parseInt(e.target.value))}
                      className="px-2 py-1 rounded border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-700 dark:text-neutral-300"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  {/* Pagination */}
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

            {/* Loading State */}
            {loading && (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-20 bg-gray-100 dark:bg-neutral-800 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
                {error}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && results?.found === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-neutral-400">No organizations found</p>
                <p className="text-sm text-gray-400 dark:text-neutral-500 mt-2">
                  Try a different search term or adjust your filters
                </p>
              </div>
            )}

            {/* Results List */}
            {!loading && results && results.hits.length > 0 && (
              <div className="space-y-3 animate-fade-in-stagger">
                {results.hits.map((hit, index) => (
                  <OrganizationCard
                    key={hit.document.id}
                    rank={(page - 1) * perPage + index + 1}
                    rorId={hit.document.ror_id}
                    name={hit.document.name}
                    country={hit.document.country}
                    city={hit.document.city}
                    workCount={hit.document.work_count}
                  />
                ))}
              </div>
            )}

            {/* Pagination (bottom) */}
            {results && totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-neutral-700"
                >
                  Previous
                </button>
                <span className="px-4 text-gray-600 dark:text-neutral-400">
                  Page {page} of {totalPages.toLocaleString()}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-neutral-700"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Filter Button - mobile only */}
      <button
        onClick={() => setFiltersOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-40 bg-black dark:bg-white text-white dark:text-black px-4 py-3 rounded-full shadow-lg flex items-center gap-2 min-h-[48px] hover:bg-gray-800 dark:hover:bg-neutral-200 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters
        {filterBy && <span className="bg-white/20 dark:bg-black/20 px-2 py-0.5 rounded-full text-xs">1</span>}
      </button>

      {/* Filter Bottom Sheet - mobile only */}
      <Dialog.Root open={filtersOpen} onOpenChange={setFiltersOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white dark:bg-neutral-900 rounded-t-2xl z-50 animate-slide-in-up overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between flex-shrink-0">
              <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                Filters
              </Dialog.Title>
              <Dialog.Close className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Dialog.Close>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <FacetFilters
                facets={results?.facet_counts || []}
                currentFilter={filterBy}
                onFilterChange={(newFilter) => {
                  handleFilterChange(newFilter);
                  setFiltersOpen(false);
                }}
              />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Footer />
    </div>
  );
}

export default function OrganizationsPage() {
  return (
    <Suspense fallback={<OrganizationsLoading />}>
      <OrganizationsContent />
    </Suspense>
  );
}
