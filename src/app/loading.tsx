import { Header, Footer } from "@/components";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero skeleton */}
        <div className="text-center mb-12">
          <div className="h-12 w-96 bg-gray-100 dark:bg-neutral-800 rounded-lg mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-[500px] max-w-full bg-gray-100 dark:bg-neutral-800 rounded mx-auto mb-2 animate-pulse" />
          <div className="h-6 w-80 bg-gray-100 dark:bg-neutral-800 rounded mx-auto mb-8 animate-pulse" />
          <div className="h-12 w-full max-w-2xl bg-gray-100 dark:bg-neutral-800 rounded-lg mx-auto animate-pulse" />
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-12">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gray-100 dark:bg-neutral-800 rounded-lg animate-pulse"
            />
          ))}
        </div>

        {/* Top organizations skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-48 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse" />
          <div className="h-6 w-24 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gray-100 dark:bg-neutral-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
