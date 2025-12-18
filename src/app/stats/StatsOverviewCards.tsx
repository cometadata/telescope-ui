"use client";

import type { GlobalStats } from "@/types";

interface StatsOverviewCardsProps {
  stats: GlobalStats | null;
  loading: boolean;
}

export function StatsOverviewCards({ stats, loading }: StatsOverviewCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 dark:bg-neutral-800 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const cards = [
    { value: stats?.total_works, label: "Total Records" },
    { value: stats?.total_institutions, label: "Organizations" },
    { value: stats?.total_countries, label: "Countries" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-8">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className="bg-white dark:bg-neutral-900 rounded-lg p-3 sm:p-6 border border-gray-200 dark:border-neutral-700 text-center min-w-0 animate-fade-in"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <p className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-900 dark:text-neutral-100 mb-1 sm:mb-2 truncate">
            {card.value?.toLocaleString()}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400">
            {card.label}
          </p>
        </div>
      ))}
    </div>
  );
}
