"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ReactNode } from "react";

interface MobileFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  onClear?: () => void;
  showClear?: boolean;
}

export function MobileFilterSheet({
  open,
  onOpenChange,
  children,
  onClear,
  showClear = false,
}: MobileFilterSheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white dark:bg-neutral-900 rounded-t-2xl z-50 animate-slide-in-up overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between flex-shrink-0">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
              Filters
            </Dialog.Title>
            <Dialog.Close className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Dialog.Close>
          </div>
          <div className="p-4 overflow-y-auto flex-1 space-y-4">
            {children}
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-neutral-700 flex gap-3">
            {showClear && onClear && (
              <button
                onClick={onClear}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-neutral-600 rounded-lg text-sm font-medium text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => onOpenChange(false)}
              className="flex-1 px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-neutral-200 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
