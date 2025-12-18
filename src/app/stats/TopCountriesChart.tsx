"use client";

import type { CountryData } from "@/types";

interface TopCountriesChartProps {
  data: CountryData[];
  loading: boolean;
  limit?: number;
}

export function TopCountriesChart({ data, loading, limit = 15 }: TopCountriesChartProps) {
  const displayData = data.slice(0, limit);
  const maxCount = displayData[0]?.work_count ?? 1;

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 border border-gray-200 dark:border-neutral-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-1">
        Top Countries
        <span className="text-sm font-normal text-gray-500 dark:text-neutral-400 ml-2">
          by record count
        </span>
      </h3>
      {loading ? (
        <div className="h-80 animate-pulse bg-gray-100 dark:bg-neutral-800 rounded" />
      ) : (
        <div className="space-y-2 mt-4 animate-fade-in-stagger">
          {displayData.map((country) => (
            <div key={country.country} className="flex items-center gap-3">
              <span className="w-24 text-sm text-gray-600 dark:text-neutral-400 truncate">
                {country.country}
              </span>
              <div className="flex-1">
                <div className="h-5 bg-gray-100 dark:bg-neutral-800 rounded overflow-hidden">
                  <div
                    className="h-full bg-black dark:bg-neutral-100 transition-all duration-500 ease-out"
                    style={{ width: `${(country.work_count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-sm text-gray-600 dark:text-neutral-400 w-16 text-right">
                {country.work_count.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
