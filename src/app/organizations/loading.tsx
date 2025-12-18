import { Header } from "@/components/Header";

export default function OrganizationsLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Header activeTab="organizations" />

      {/* Search bar skeleton */}
      <div className="border-b border-gray-200 dark:border-neutral-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-3xl mx-auto">
            <div className="h-12 bg-gray-100 dark:bg-neutral-800 rounded-lg animate-pulse" />
            <div className="mt-2 flex justify-center gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-5 w-16 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar skeleton */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="h-5 w-20 bg-gray-100 dark:bg-neutral-800 rounded mb-3 animate-pulse" />
                  <div className="space-y-2">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="h-5 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Results skeleton */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <div className="h-6 w-48 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse" />
              <div className="h-8 w-32 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse" />
            </div>
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 dark:bg-neutral-800 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
