"use client";

import Link from "next/link";
import {
  FilterSelect,
  FloatingFilterButton,
  MobileFilterSheet,
} from "@/components";
import { ARXIV_SUBJECTS } from "@/lib/subjects";
import type { UseFiltersReturn } from "@/hooks";

interface Collaborator {
  ror_id: string;
  name: string;
  country: string;
  collaboration_count: number;
  filteredCount?: number;
}

interface CollaboratorsSectionProps {
  collaborators: Collaborator[];
  loading: boolean;
  filters: UseFiltersReturn;
  countries: string[];
  years: number[];
  buildSearchUrl: (rorId: string, name: string) => string;
}

export function CollaboratorsSection({
  collaborators,
  loading,
  filters,
  countries,
  years,
  buildSearchUrl,
}: CollaboratorsSectionProps) {
  const hasApiFilters = filters.year || filters.subject;

  return (
    <>
      <section className="mb-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-neutral-100">
              Top Collaborators
              {filters.country && (
                <span className="text-gray-500 dark:text-neutral-400 font-normal ml-2">
                  in {filters.country}
                </span>
              )}
              <span className="text-gray-400 dark:text-neutral-500 font-normal text-sm sm:text-base ml-2 tabular-nums">
                ({collaborators.length})
              </span>
            </h2>
            <button
              onClick={filters.clear}
              className={`hidden lg:block px-3 py-1.5 text-sm text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 ${
                filters.hasFilters ? "lg:visible" : "lg:invisible"
              }`}
            >
              Clear filters
            </button>
          </div>

          {/* Desktop Filters */}
          <div className="hidden lg:flex flex-wrap items-center gap-3">
            <FilterSelect
              label="Country"
              value={filters.country}
              onChange={filters.setCountry}
              options={countries.map((c) => ({ value: c, label: c }))}
              placeholder="All Countries"
            />
            <FilterSelect
              label="Year"
              value={filters.year}
              onChange={filters.setYear}
              options={years.map((y) => ({ value: y.toString(), label: y.toString() }))}
              placeholder="All Years"
            />
            <FilterSelect
              label="Subject"
              value={filters.subject}
              onChange={filters.setSubject}
              options={Object.entries(ARXIV_SUBJECTS).map(([code, name]) => ({ value: code, label: name }))}
              placeholder="All Subjects"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 dark:bg-neutral-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : collaborators.length === 0 ? (
          <p className="text-gray-500 dark:text-neutral-400 text-center py-8">
            No collaborating organizations match the selected filters.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-stagger">
            {collaborators.map((collab, index) => {
              const rorHash = collab.ror_id.replace("https://ror.org/", "");
              const displayCount = hasApiFilters && collab.filteredCount !== undefined
                ? collab.filteredCount
                : collab.collaboration_count;
              return (
                <div
                  key={collab.ror_id}
                  className="bg-white dark:bg-neutral-900 rounded-lg p-4 border border-gray-200 dark:border-neutral-700"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-neutral-400">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/organization/${rorHash}`}
                        className="font-semibold text-gray-900 dark:text-neutral-100 truncate block hover:underline"
                      >
                        {collab.name}
                      </Link>
                      <p className="text-sm text-gray-500 dark:text-neutral-400">
                        {collab.country}
                      </p>
                    </div>
                    <Link
                      href={buildSearchUrl(collab.ror_id, collab.name)}
                      className="text-right flex-shrink-0 border border-gray-200 dark:border-neutral-700 hover:border-gray-400 dark:hover:border-neutral-500 rounded-lg px-3 py-2 transition-colors"
                    >
                      <p className="text-lg font-bold text-gray-900 dark:text-neutral-100">
                        {displayCount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-neutral-400">co-authored</p>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Mobile only */}
      <FloatingFilterButton
        onClick={() => filters.setIsOpen(true)}
        activeFilterCount={filters.activeCount}
      />

      <MobileFilterSheet
        open={filters.isOpen}
        onOpenChange={filters.setIsOpen}
        showClear={filters.hasFilters}
        onClear={filters.clear}
      >
        <FilterSelect
          label="Country"
          value={filters.country}
          onChange={filters.setCountry}
          options={countries.map((c) => ({ value: c, label: c }))}
          placeholder="All Countries"
          mobile
        />
        <FilterSelect
          label="Year"
          value={filters.year}
          onChange={filters.setYear}
          options={years.map((y) => ({ value: y.toString(), label: y.toString() }))}
          placeholder="All Years"
          mobile
        />
        <FilterSelect
          label="Subject"
          value={filters.subject}
          onChange={filters.setSubject}
          options={Object.entries(ARXIV_SUBJECTS).map(([code, name]) => ({ value: code, label: name }))}
          placeholder="All Subjects"
          mobile
        />
      </MobileFilterSheet>
    </>
  );
}
