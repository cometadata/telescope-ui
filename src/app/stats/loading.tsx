import { Header } from "@/components/Header";

export default function StatsLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Header activeTab="statistics" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats overview skeleton */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-neutral-800 rounded-lg animate-pulse" />
          ))}
        </div>

        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 border border-gray-200 dark:border-neutral-700">
            <div className="h-6 w-48 bg-gray-100 dark:bg-neutral-800 rounded mb-4 animate-pulse" />
            <div className="h-80 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse" />
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 border border-gray-200 dark:border-neutral-700">
            <div className="h-6 w-36 bg-gray-100 dark:bg-neutral-800 rounded mb-4 animate-pulse" />
            <div className="h-80 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse" />
          </div>
        </div>

        {/* Top organizations skeleton */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="h-7 w-48 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse" />
            <div className="flex gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-9 w-32 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse" />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 dark:bg-neutral-800 rounded-lg animate-pulse" />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
