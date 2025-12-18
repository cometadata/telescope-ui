"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300"
      >
        Previous
      </button>
      <span className="px-4 text-gray-600 dark:text-neutral-400">
        Page {currentPage} of {totalPages.toLocaleString()}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300"
      >
        Next
      </button>
    </div>
  );
}
