interface StatsCardProps {
  title: string;
  value?: number | string;
  loading?: boolean;
  isText?: boolean;
}

export function StatsCard({ title, value, loading, isText }: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg p-3 sm:p-6 border border-gray-200 dark:border-neutral-700 text-center min-w-0">
      {loading ? (
        <div className="h-10 w-32 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse mx-auto mb-2" />
      ) : (
        <p className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-900 dark:text-neutral-100 mb-1 sm:mb-2 truncate animate-fade-in">
          {isText ? value : (typeof value === "number" ? value.toLocaleString() : value ?? "—")}
        </p>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400">{title}</p>
    </div>
  );
}
