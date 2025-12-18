"use client";

import { useState, useEffect } from "react";
import { ARXIV_SUBJECTS } from "@/lib/subjects";

interface ActiveFiltersProps {
  filterBy: string;
  onFilterChange: (filter: string) => void;
}

interface ParsedFilter {
  field: string;
  values: string[];
}

interface OrganizationInfo {
  name: string;
  ror_id: string;
}

function parseFilterString(filterBy: string): ParsedFilter[] {
  if (!filterBy) return [];

  const filters: ParsedFilter[] = [];
  const parts = filterBy.split(" && ");

  for (const part of parts) {
    // Match patterns like: field:=value, field:=`value`, field:=[val1,val2], field:=[`val1`,`val2`]
    const match = part.match(/^(\w+):=?\[?([^\]]+)\]?$/);
    if (match) {
      const [, field, valuesStr] = match;
      // Split by comma but handle backtick-quoted values
      const values = valuesStr
        .split(",")
        .map((v) => v.replace(/`/g, "").trim())
        .filter(Boolean);
      filters.push({ field, values });
    }
  }

  return filters;
}

function buildFilterString(filters: ParsedFilter[]): string {
  return filters
    .filter((f) => f.values.length > 0)
    .map((f) => {
      if (f.values.length === 1) {
        const val = f.values[0];
        if (f.field === "year") {
          return `${f.field}:=${val}`;
        }
        return `${f.field}:=\`${val}\``;
      } else {
        if (f.field === "year") {
          return `${f.field}:=[${f.values.join(",")}]`;
        }
        return `${f.field}:=[${f.values.map((v) => `\`${v}\``).join(",")}]`;
      }
    })
    .join(" && ");
}

function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    ror_ids: "Organization",
    subject_codes: "Subject",
    year: "Year",
    countries: "Country",
  };
  return labels[field] || field;
}

function getSubjectLabel(code: string): string {
  return ARXIV_SUBJECTS[code] || code;
}

export function ActiveFilters({ filterBy, onFilterChange }: ActiveFiltersProps) {
  const [organizationNames, setOrganizationNames] = useState<Record<string, string>>({});
  const [fetchedIds, setFetchedIds] = useState<Set<string>>(new Set());

  const filters = parseFilterString(filterBy);

  const rorIds = filters
    .filter((f) => f.field === "ror_ids")
    .flatMap((f) => f.values);

  // Derive loading state: loading if we have IDs that haven't been fetched yet
  const loadingOrganizations = rorIds.some((id) => !fetchedIds.has(id));

  useEffect(() => {
    if (rorIds.length === 0) return;

    const idsToFetch = rorIds.filter((id) => !fetchedIds.has(id));
    if (idsToFetch.length === 0) return;

    let cancelled = false;

    (async () => {
      const results = await Promise.all(
        idsToFetch.map(async (rorId) => {
          try {
            const rorHash = rorId.replace("https://ror.org/", "");
            const response = await fetch(`/data/institutions/${rorHash}.json`);
            if (response.ok) {
              const data: OrganizationInfo = await response.json();
              return { rorId, name: data.name };
            }
          } catch {
            // Ignore errors, will fall back to showing ROR ID
          }
          return { rorId, name: null };
        })
      );

      if (cancelled) return;

      const newNames: Record<string, string> = {};
      for (const result of results) {
        if (result.name) {
          newNames[result.rorId] = result.name;
        }
      }
      setOrganizationNames((prev) => ({ ...prev, ...newNames }));
      setFetchedIds((prev) => new Set([...prev, ...idsToFetch]));
    })();

    return () => {
      cancelled = true;
    };
  }, [rorIds.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  const removeFilter = (field: string, value: string) => {
    const newFilters = filters.map((f) => {
      if (f.field === field) {
        return { ...f, values: f.values.filter((v) => v !== value) };
      }
      return f;
    }).filter((f) => f.values.length > 0);

    onFilterChange(buildFilterString(newFilters));
  };

  const clearAll = () => {
    onFilterChange("");
  };

  const getValueLabel = (field: string, value: string): string => {
    if (field === "ror_ids") {
      if (loadingOrganizations && !organizationNames[value]) {
        return "Loading...";
      }
      return organizationNames[value] || value.replace("https://ror.org/", "");
    }
    if (field === "subject_codes") {
      return getSubjectLabel(value);
    }
    return value;
  };

  if (filters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 py-3">
      <span className="text-sm text-gray-500 dark:text-neutral-400 mr-1">Filtering by:</span>

      {filters.map((filter) =>
        filter.values.map((value) => (
          <span
            key={`${filter.field}-${value}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-neutral-200 rounded-full text-sm"
          >
            <span className="text-gray-500 dark:text-neutral-400 text-xs font-medium">
              {getFieldLabel(filter.field)}:
            </span>
            <span className="font-medium truncate max-w-[200px]" title={getValueLabel(filter.field, value)}>
              {getValueLabel(filter.field, value)}
            </span>
            <button
              onClick={() => removeFilter(filter.field, value)}
              className="ml-1 text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300 transition-colors"
              aria-label={`Remove ${getFieldLabel(filter.field)} filter`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </span>
        ))
      )}

      {filters.length > 0 && (
        <button
          onClick={clearAll}
          className="text-sm text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 underline ml-2"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
