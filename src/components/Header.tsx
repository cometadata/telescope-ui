"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";

interface HeaderProps {
  activeTab?: "search" | "statistics" | "organizations" | "about";
}

export function Header({ activeTab }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { resolvedTheme } = useTheme();

  return (
    <header className="border-b border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between relative">
          {/* opacity-0 until theme resolves to prevent wrong logo flash */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src={resolvedTheme === "dark" ? "/inverted-logo.svg" : "/logo.svg"}
              alt="COMET"
              width={140}
              height={40}
              priority
              className={resolvedTheme === undefined ? "opacity-0" : "opacity-100"}
            />
          </Link>

          {/* Centered title hidden on smaller screens to prevent nav overlap */}
          <Link href="/" className="hidden lg:block absolute left-1/2 -translate-x-1/2">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-neutral-100 hover:text-gray-600 dark:hover:text-neutral-300 transition-colors">
              Telescope
            </h1>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 transition-colors"
            aria-label="Open menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/search"
              className={`px-3 py-2 text-sm font-medium rounded border transition-colors ${
                activeTab === "search"
                  ? "bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-neutral-100"
                  : "border-transparent text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100"
              }`}
            >
              Search
            </Link>
            <Link
              href="/organizations"
              className={`px-3 py-2 text-sm font-medium rounded border transition-colors ${
                activeTab === "organizations"
                  ? "bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-neutral-100"
                  : "border-transparent text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100"
              }`}
            >
              Organizations
            </Link>
            <Link
              href="/stats"
              className={`px-3 py-2 text-sm font-medium rounded border transition-colors ${
                activeTab === "statistics"
                  ? "bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-neutral-100"
                  : "border-transparent text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100"
              }`}
            >
              Statistics
            </Link>
            <Link
              href="/about"
              className={`px-3 py-2 text-sm font-medium rounded border transition-colors ${
                activeTab === "about"
                  ? "bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-neutral-100"
                  : "border-transparent text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100"
              }`}
            >
              About
            </Link>
            <ThemeToggle className="ml-2" />
          </nav>

          <Dialog.Root open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
              <Dialog.Content className="fixed left-0 top-0 h-full w-[280px] bg-white dark:bg-neutral-900 z-50 animate-slide-in-left shadow-xl">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-700">
                  <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                    Menu
                  </Dialog.Title>
                  <div className="flex items-center gap-1">
                    <ThemeToggle />
                    <Dialog.Close className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 transition-colors">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Dialog.Close>
                  </div>
                </div>
                <nav className="p-4 space-y-2">
                  <Link
                    href="/search"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                      activeTab === "search"
                        ? "bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-neutral-100"
                        : "text-gray-600 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-neutral-100"
                    }`}
                  >
                    Search
                  </Link>
                  <Link
                    href="/organizations"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                      activeTab === "organizations"
                        ? "bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-neutral-100"
                        : "text-gray-600 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-neutral-100"
                    }`}
                  >
                    Organizations
                  </Link>
                  <Link
                    href="/stats"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                      activeTab === "statistics"
                        ? "bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-neutral-100"
                        : "text-gray-600 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-neutral-100"
                    }`}
                  >
                    Statistics
                  </Link>
                  <Link
                    href="/about"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                      activeTab === "about"
                        ? "bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-neutral-100"
                        : "text-gray-600 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-neutral-100"
                    }`}
                  >
                    About
                  </Link>
                </nav>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
}
