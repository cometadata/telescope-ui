"use client";

import {
  OrganizationCard,
  FilterSelect,
  FloatingFilterButton,
  MobileFilterSheet,
  Pagination,
} from "@/components";
import type { OrganizationSummary } from "@/types";
import type { UseFiltersReturn } from "@/hooks";

interface OrganizationsSectionProps {
  organizations: (OrganizationSummary & { filteredCount?: number })[];
  totalCount: number;
  loading: boolean;
  filters: UseFiltersReturn;
  countries: string[];
  years: number[];
  subjects: [string, string][];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  buildSearchUrl: (rorId: string) => string;
  itemsPerPage: number;
}

export function OrganizationsSection({
  organizations,
  totalCount,
  loading,
  filters,
  countries,
  years,
  subjects,
  currentPage,
  totalPages,
  onPageChange,
  buildSearchUrl,
  itemsPerPage,
}: OrganizationsSectionProps) {
  if (loading) {
    return (
      <section>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="h-7 w-48 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse" />
          <div className="flex gap-3">
            <div className="h-9 w-32 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse" />
            <div className="h-9 w-28 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse" />
            <div className="h-9 w-36 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(itemsPerPage)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 dark:bg-neutral-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      {/* Header with title and filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 animate-fade-in">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-neutral-100 min-w-0 truncate">
            <span>Top Organizations</span>
            {filters.country && (
              <span className="text-gray-500 dark:text-neutral-400 font-normal ml-2">
                in {filters.country}
              </span>
            )}
            <span className="text-gray-400 dark:text-neutral-500 font-normal text-sm sm:text-base ml-2 tabular-nums">
              ({totalCount})
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
            options={subjects.map(([code, name]) => ({ value: code, label: name }))}
            placeholder="All Subjects"
          />
        </div>
      </div>

      {/* Organizations Grid */}
      {organizations.length === 0 ? (
        <div className="text-center py-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-neutral-800 mb-4">
            <svg className="w-8 h-8 text-gray-400 dark:text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-neutral-100 mb-1">
            No organizations found
          </h3>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mb-4">
            No organizations match the selected filters. Try adjusting your criteria.
          </p>
          <button
            onClick={filters.clear}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-neutral-300 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-stagger">
          {organizations.map((org, index) => {
            const fullRorId = org.ror_id.startsWith("https://") ? org.ror_id : `https://ror.org/${org.ror_id}`;
            const displayCount = filters.hasFilters && org.filteredCount !== undefined
              ? org.filteredCount
              : org.work_count;
            const rank = (currentPage - 1) * itemsPerPage + index + 1;

            return (
              <OrganizationCard
                key={org.ror_id}
                rank={rank}
                rorId={org.ror_id}
                name={org.name}
                city={org.city}
                country={org.country}
                workCount={displayCount}
                searchUrl={buildSearchUrl(fullRorId)}
              />
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        className="mt-6"
      />

      {/* Mobile Filter Button */}
      <FloatingFilterButton
        onClick={() => filters.setIsOpen(true)}
        activeFilterCount={filters.activeCount}
      />

      {/* Mobile Filter Sheet */}
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
          options={subjects.map(([code, name]) => ({ value: code, label: name }))}
          placeholder="All Subjects"
          mobile
        />
      </MobileFilterSheet>
    </section>
  );
}
