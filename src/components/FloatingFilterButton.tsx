"use client";

interface FloatingFilterButtonProps {
  onClick: () => void;
  activeFilterCount?: number;
}

export function FloatingFilterButton({
  onClick,
  activeFilterCount = 0,
}: FloatingFilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden fixed bottom-4 right-4 z-40 bg-black dark:bg-white text-white dark:text-black px-4 py-3 rounded-full shadow-lg flex items-center gap-2 min-h-[48px] hover:bg-gray-800 dark:hover:bg-neutral-200 transition-colors"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
      Filters
      {activeFilterCount > 0 && (
        <span className="bg-white/20 dark:bg-black/20 px-2 py-0.5 rounded-full text-xs">
          {activeFilterCount}
        </span>
      )}
    </button>
  );
}
