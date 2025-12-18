import { Header } from "@/components/Header";

export default function OrganizationLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Organization Header skeleton */}
        <div className="mb-12">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="h-9 w-80 bg-gray-100 dark:bg-neutral-800 rounded mb-3 animate-pulse" />
              <div className="h-5 w-48 bg-gray-100 dark:bg-neutral-800 rounded mb-3 animate-pulse" />
              <div className="flex gap-2">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-9 w-24 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse" />
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="h-24 w-32 bg-gray-100 dark:bg-neutral-800 rounded-xl animate-pulse" />
              <div className="h-10 w-28 bg-gray-100 dark:bg-neutral-800 rounded-lg animate-pulse" />
            </div>
          </div>
          <div className="mt-6">
            <div className="h-5 w-32 bg-gray-100 dark:bg-neutral-800 rounded mb-4 animate-pulse" />
            <div className="flex flex-wrap gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-8 w-24 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>

        {/* Time Series skeleton */}
        <section className="mb-12">
          <div className="h-7 w-40 bg-gray-100 dark:bg-neutral-800 rounded mb-4 animate-pulse" />
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 border border-gray-200 dark:border-neutral-700">
            <div className="h-64 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse" />
          </div>
        </section>

        {/* Top Collaborators skeleton */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="h-7 w-72 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse" />
            <div className="flex gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-9 w-32 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse" />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 dark:bg-neutral-800 rounded-lg animate-pulse" />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
