"use client";

import { useState, useEffect, useRef, useCallback, FormEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { ARXIV_SUBJECTS, getSubjectName } from "@/lib/subjects";
import { useRequestToken } from "@/hooks/useRequestToken";

interface Suggestion {
  type: "institution" | "subject" | "year" | "country";
  value: string;
  label: string;
  sublabel?: string;
  count?: number;
}

interface SelectedField {
  type: "org" | "subject" | "year" | "country";
  value: string;
  label: string;
}

interface FieldedSearchBarProps {
  initialQuery?: string;
  initialFilters?: string;
  /** Map of ROR ID/hash to display name for resolving filter labels */
  initialOrgLabels?: Record<string, string>;
}

const FIELD_CONFIG = {
  org: { filterField: "ror_ids", placeholder: "Organization name", isNumeric: false },
  subject: { filterField: "subject_codes", placeholder: "Subject area", isNumeric: false },
  year: { filterField: "year", placeholder: "Year (e.g., 2024)", isNumeric: true },
  country: { filterField: "countries", placeholder: "Country name", isNumeric: false },
} as const;

type FieldType = keyof typeof FIELD_CONFIG;

// Stable empty object for default prop to prevent infinite re-renders
const EMPTY_ORG_LABELS: Record<string, string> = {};

function isUnresolvedOrg(field: SelectedField): boolean {
  if (field.type !== "org") return false;
  const rorHash = field.value.replace("https://ror.org/", "");
  return field.label === rorHash;
}

const SUBJECT_LIST: Suggestion[] = Object.entries(ARXIV_SUBJECTS).map(([code, name]) => ({
  type: "subject",
  value: code,
  label: name,
  sublabel: code,
}));

function parseInitialFilters(filterBy: string, orgLabels?: Record<string, string>): SelectedField[] {
  if (!filterBy) return [];

  const fields: SelectedField[] = [];
  const parts = filterBy.split(" && ");

  for (const part of parts) {
    const match = part.match(/^(\w+):=?\[?([^\]]+)\]?$/);
    if (match) {
      const [, field, valuesStr] = match;
      // Split on commas that are outside backticks
      const values: string[] = [];
      let current = "";
      let inBacktick = false;
      for (const char of valuesStr) {
        if (char === "`") {
          inBacktick = !inBacktick;
        } else if (char === "," && !inBacktick) {
          if (current.trim()) values.push(current.replace(/`/g, "").trim());
          current = "";
          continue;
        }
        current += char;
      }
      if (current.trim()) values.push(current.replace(/`/g, "").trim());

      for (const value of values) {
        if (field === "ror_ids") {
          const rorHash = value.replace("https://ror.org/", "");
          const label = orgLabels?.[value] || orgLabels?.[rorHash] || rorHash;
          fields.push({ type: "org", value, label });
        } else if (field === "institution_names") {
          fields.push({ type: "org", value, label: value });
        } else if (field === "subject_codes") {
          fields.push({ type: "subject", value, label: getSubjectName(value) || value });
        } else if (field === "year") {
          fields.push({ type: "year", value, label: value });
        } else if (field === "countries") {
          fields.push({ type: "country", value, label: value });
        }
      }
    }
  }

  return fields;
}

export function FieldedSearchBar({ initialQuery = "", initialFilters = "", initialOrgLabels = EMPTY_ORG_LABELS }: FieldedSearchBarProps) {
  const [textQuery, setTextQuery] = useState(initialQuery);
  const [selectedFields, setSelectedFields] = useState<SelectedField[]>(() => parseInitialFilters(initialFilters, initialOrgLabels));
  const [activeField, setActiveField] = useState<FieldType | null>(null);
  const [fieldQuery, setFieldQuery] = useState("");
  const { getHeaders } = useRequestToken();

  useEffect(() => {
    setTextQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setSelectedFields(parseInitialFilters(initialFilters, initialOrgLabels));
  }, [initialFilters, initialOrgLabels]);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);

  const [yearList, setYearList] = useState<Suggestion[]>([]);
  const [countryList, setCountryList] = useState<Suggestion[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadStaticData() {
      try {
        const [yearsRes, countriesRes] = await Promise.all([
          fetch("/data/stats/by-year.json"),
          fetch("/data/stats/by-country.json"),
        ]);

        if (yearsRes.ok) {
          const years: { year: number; count: number }[] = await yearsRes.json();
          setYearList(
            years
              .filter((y) => y.year > 0)
              .sort((a, b) => b.year - a.year)
              .map((y) => ({
                type: "year" as const,
                value: y.year.toString(),
                label: y.year.toString(),
                count: y.count,
              }))
          );
        }

        if (countriesRes.ok) {
          const countries: { country: string; work_count: number }[] = await countriesRes.json();
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
        console.error("Failed to load static data:", error);
      }
    }
    loadStaticData();
  }, []);

  const fetchInstitutionSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/autocomplete?q=${encodeURIComponent(query)}&type=institution`, {
        headers: getHeaders(),
      });
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error("Autocomplete error:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  const filterSubjectSuggestions = useCallback((query: string) => {
    if (query.length < 1) {
      setSuggestions(SUBJECT_LIST.slice(0, 10));
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = SUBJECT_LIST.filter(
      (s) =>
        s.label.toLowerCase().includes(lowerQuery) ||
        s.value.toLowerCase().includes(lowerQuery)
    ).slice(0, 10);

    setSuggestions(filtered);
  }, []);

  const filterYearSuggestions = useCallback((query: string) => {
    if (!query) {
      setSuggestions(yearList.slice(0, 10));
      return;
    }

    const filtered = yearList.filter((y) => y.value.includes(query)).slice(0, 10);
    setSuggestions(filtered);
  }, [yearList]);

  const filterCountrySuggestions = useCallback((query: string) => {
    if (!query) {
      setSuggestions(countryList.slice(0, 10));
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = countryList
      .filter((c) => c.label.toLowerCase().includes(lowerQuery))
      .slice(0, 10);

    setSuggestions(filtered);
  }, [countryList]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    const fieldPatterns: { pattern: RegExp; field: FieldType; filter: (q: string) => void }[] = [
      { pattern: /\borg:$/i, field: "org", filter: fetchInstitutionSuggestions },
      { pattern: /\bsubject:$/i, field: "subject", filter: filterSubjectSuggestions },
      { pattern: /\byear:$/i, field: "year", filter: filterYearSuggestions },
      { pattern: /\bcountry:$/i, field: "country", filter: filterCountrySuggestions },
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
      switch (activeField) {
        case "org":
          fetchInstitutionSuggestions(value);
          break;
        case "subject":
          filterSubjectSuggestions(value);
          break;
        case "year":
          filterYearSuggestions(value);
          break;
        case "country":
          filterCountrySuggestions(value);
          break;
      }
    } else {
      setTextQuery(value);
    }
  };

  const suggestionTypeToFieldType = (type: Suggestion["type"]): SelectedField["type"] => {
    switch (type) {
      case "institution": return "org";
      case "subject": return "subject";
      case "year": return "year";
      case "country": return "country";
    }
  };

  const selectSuggestion = (suggestion: Suggestion) => {
    const newField: SelectedField = {
      type: suggestionTypeToFieldType(suggestion.type),
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

  const removeField = (index: number) => {
    setSelectedFields((prev) => prev.filter((_, i) => i !== index));
  };

  const cancelFieldInput = () => {
    setActiveField(null);
    setFieldQuery("");
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
  };

  // Double-backspace exits field mode when query is empty
  const [lastBackspaceTime, setLastBackspaceTime] = useState(0);

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
        const now = Date.now();
        if (now - lastBackspaceTime < 500) {
          e.preventDefault();
          cancelFieldInput();
          setLastBackspaceTime(0);
          return;
        }
        setLastBackspaceTime(now);
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

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();

    const params = new URLSearchParams();

    if (textQuery.trim()) {
      params.set("q", textQuery.trim());
    }

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
      const isNumeric = filterField === "year";

      // AND logic for ror_ids enables finding cross-institution collaborations
      if (filterField === "ror_ids") {
        for (const value of values) {
          filterParts.push(`${filterField}:=\`${value}\``);
        }
      } else if (values.length === 1) {
        // Numeric fields don't use backticks
        if (isNumeric) {
          filterParts.push(`${filterField}:=${values[0]}`);
        } else {
          filterParts.push(`${filterField}:=\`${values[0]}\``);
        }
      } else if (values.length > 1) {
        // OR: works can have ANY of the selected values
        if (isNumeric) {
          filterParts.push(`${filterField}:=[${values.join(",")}]`);
        } else {
          filterParts.push(`${filterField}:=[${values.map((v) => `\`${v}\``).join(",")}]`);
        }
      }
    }

    if (filterParts.length > 0) {
      params.set("filter_by", filterParts.join(" && "));
    }

    const url = params.toString() ? `/search?${params.toString()}` : "/search";
    router.push(url);
  };

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

  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const items = suggestionsRef.current.querySelectorAll("[data-suggestion]");
      items[selectedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  // Filters from URL only have ROR IDs - resolve to display names via API
  useEffect(() => {
    const resolveNames = async () => {
      const fieldsToResolve = selectedFields.filter(
        (f) => f.type === "org" && f.label === f.value.replace("https://ror.org/", "")
      );

      if (fieldsToResolve.length === 0) return;

      const updates: Record<string, string> = {};

      await Promise.all(
        fieldsToResolve.map(async (field) => {
          try {
            const rorHash = field.value.replace("https://ror.org/", "");
            let response = await fetch(`/api/institutions/${rorHash}`);
            if (!response.ok) {
              response = await fetch(`/data/institutions/${rorHash}.json`);
            }
            if (response.ok) {
              const data = await response.json();
              updates[field.value] = data.name;
            }
          } catch {
            // Fallback: keep ROR ID as label
          }
        })
      );

      if (Object.keys(updates).length > 0) {
        setSelectedFields((prev) =>
          prev.map((f) =>
            updates[f.value] ? { ...f, label: updates[f.value] } : f
          )
        );
      }
    };

    resolveNames();
  }, [selectedFields]);

  const inputValue = activeField ? fieldQuery : textQuery;
  const inputPlaceholder = activeField
    ? `Search ${FIELD_CONFIG[activeField].placeholder}...`
    : selectedFields.length > 0
    ? "Add more filters or search text..."
    : "Search works... Type org: or subject: for filters";

  return (
    <div className="w-full">
      <div className="relative">
        <form onSubmit={handleSubmit} className="w-full flex items-center gap-2">
          <div className="flex-1 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 focus-within:ring-2 focus-within:ring-gray-400 dark:focus-within:ring-neutral-500 focus-within:border-transparent overflow-x-auto scrollbar-hide">
            {selectedFields.map((field, index) => (
              <span
                key={`${field.type}-${field.value}-${index}`}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-neutral-200 flex-shrink-0"
              >
                {isUnresolvedOrg(field) ? (
                  <span className="inline-block w-24 h-4 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
                ) : (
                  <span className="whitespace-nowrap" title={field.label}>
                    {field.label}
                  </span>
                )}
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

            {activeField && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-neutral-200 flex-shrink-0">
                <span className="font-medium">{activeField}:</span>
              </span>
            )}

            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (activeField) {
                  setShowSuggestions(true);
                  switch (activeField) {
                    case "subject":
                      filterSubjectSuggestions(fieldQuery);
                      break;
                    case "year":
                      filterYearSuggestions(fieldQuery);
                      break;
                    case "country":
                      filterCountrySuggestions(fieldQuery);
                      break;
                  }
                }
              }}
              placeholder={inputPlaceholder}
              className="flex-1 min-w-[150px] px-1 py-1 text-base bg-transparent text-gray-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="flex-shrink-0 p-3 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 rounded-lg transition-colors"
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

        {showSuggestions && (activeField || suggestions.length > 0) && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg max-h-72 overflow-y-auto"
          >
            {loading && (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-neutral-400 flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Searching...
              </div>
            )}

            {!loading && suggestions.length === 0 && activeField && fieldQuery.length >= 2 && (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-neutral-400">
                No matches found for &quot;{fieldQuery}&quot;
              </div>
            )}

            {!loading && suggestions.length === 0 && activeField && fieldQuery.length < 2 && (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-neutral-400">
                Type at least 2 characters to search
              </div>
            )}

            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.value}`}
                data-suggestion
                onClick={() => selectSuggestion(suggestion)}
                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 flex items-center justify-between gap-2 ${
                  index === selectedIndex ? "bg-gray-100 dark:bg-neutral-800" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-neutral-100 truncate">{suggestion.label}</div>
                  {suggestion.sublabel && (
                    <div className="text-xs text-gray-500 dark:text-neutral-400 truncate">{suggestion.sublabel}</div>
                  )}
                </div>
                {suggestion.count !== undefined && (
                  <span className="flex-shrink-0 text-xs text-gray-400 dark:text-neutral-500 bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                    {suggestion.count.toLocaleString()} works
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-neutral-400">
        <span>Filters:</span>
        <button
          type="button"
          onClick={() => {
            setActiveField("org");
            setFieldQuery("");
            setShowSuggestions(true);
            fetchInstitutionSuggestions("");
            inputRef.current?.focus();
          }}
          className="px-1.5 py-0.5 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded text-gray-600 dark:text-neutral-400 transition-colors"
        >
          org:
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
          className="px-1.5 py-0.5 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded text-gray-600 dark:text-neutral-400 transition-colors"
        >
          subject:
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveField("year");
            setFieldQuery("");
            setShowSuggestions(true);
            filterYearSuggestions("");
            inputRef.current?.focus();
          }}
          className="px-1.5 py-0.5 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded text-gray-600 dark:text-neutral-400 transition-colors"
        >
          year:
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
          className="px-1.5 py-0.5 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded text-gray-600 dark:text-neutral-400 transition-colors"
        >
          country:
        </button>
      </div>
    </div>
  );
}
