"use client";

import Link from "next/link";
import {
  Header,
  Footer,
  FieldedSearchBar,
  StatsCard,
  OrganizationCard,
} from "@/components";
import type { GlobalStats, OrganizationSummary } from "@/types";

interface HomeClientProps {
  stats: GlobalStats | null;
  topOrganizations: OrganizationSummary[];
}

export default function HomeClient({
  stats,
  topOrganizations,
}: HomeClientProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-neutral-100 mb-4">
            Explore arXiv Research
          </h2>
          <p className="text-lg text-gray-600 dark:text-neutral-400 max-w-2xl mx-auto mb-8">
            Discover emerging research, collaboration patterns and networks,
            worldwide
          </p>

          <div className="max-w-2xl mx-auto">
            <FieldedSearchBar />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-12 animate-fade-in-stagger">
          <StatsCard title="Works" value={stats?.total_works} />
          <StatsCard title="Organizations" value={stats?.total_institutions} />
          <StatsCard title="Countries" value={stats?.total_countries} />
        </div>

        {/* Top Organizations */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-neutral-100">
              Top Organizations
            </h3>
            <Link
              href="/stats"
              className="text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white text-sm sm:text-base"
            >
              View all &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-stagger">
            {topOrganizations.map((org, index) => (
              <OrganizationCard
                key={org.ror_id}
                rank={index + 1}
                rorId={org.ror_id}
                name={org.name}
                city={org.city}
                country={org.country}
                workCount={org.work_count}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
