import Link from "next/link";

interface OrganizationCardProps {
  rank?: number;
  rorId: string;
  name: string;
  country: string;
  city?: string;
  workCount: number;
  searchUrl?: string;
}

export function OrganizationCard({
  rank,
  rorId,
  name,
  country,
  city,
  workCount,
  searchUrl,
}: OrganizationCardProps) {
  const rorHash = rorId.replace("https://ror.org/", "");
  const fullRorId = rorId.startsWith("https://") ? rorId : `https://ror.org/${rorId}`;
  const workSearchUrl = searchUrl || `/search?filter_by=ror_ids:=\`${fullRorId}\``;

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-neutral-700 overflow-hidden">
      <div className="flex items-center gap-2 sm:gap-4">
        {rank && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-neutral-400">
            {rank}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <Link
            href={`/organization/${rorHash}`}
            className="font-semibold text-gray-900 dark:text-neutral-100 truncate block hover:underline"
          >
            {name}
          </Link>
          <p className="text-sm text-gray-500 dark:text-neutral-400">
            {city && `${city}, `}{country}
          </p>
        </div>
        <Link
          href={workSearchUrl}
          className="text-right flex-shrink-0 border border-gray-200 dark:border-neutral-700 hover:border-gray-400 dark:hover:border-neutral-500 rounded-lg px-3 py-2 transition-colors"
        >
          <p className="text-lg font-bold text-gray-900 dark:text-neutral-100">
            {workCount.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-neutral-400">works</p>
        </Link>
      </div>
    </div>
  );
}
