"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";

interface OrganizationHeaderProps {
  name: string;
  country: string;
  cityName?: string;
  types: string[];
  rorId: string;
  workCount: number;
  links: { type?: string; value: string }[];
}

export function OrganizationHeader({
  name,
  country,
  cityName,
  types,
  rorId,
  workCount,
  links,
}: OrganizationHeaderProps) {
  const { resolvedTheme } = useTheme();

  return (
    <div className="flex flex-wrap items-start justify-between gap-6">
      {/* Left: Name, Location, Links */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-100">
          {name}
        </h1>
        <p className="text-gray-600 dark:text-neutral-400 mt-1 flex items-center gap-2">
          <span>
            {cityName && `${cityName}, `}{country}
            {types.length > 0 && (
              <span className="text-gray-400 dark:text-neutral-500">
                {" · "}
                {types.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(", ")}
              </span>
            )}
          </span>
          <a
            href={rorId}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-70 transition-opacity"
          >
            <Image
              src={resolvedTheme === "dark" ? "/inverted-ror.svg" : "/ror.svg"}
              alt="ROR"
              width={40}
              height={18}
              className={resolvedTheme === undefined ? "opacity-0" : "opacity-100"}
            />
          </a>
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.value}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 border border-gray-300 dark:border-neutral-600 rounded-md text-sm text-gray-600 dark:text-neutral-400 hover:border-gray-400 dark:hover:border-neutral-500 transition-colors"
            >
              {link.type || "Website"}
            </a>
          ))}
        </div>
      </div>

      {/* Right: Work Count & Search */}
      <div className="flex flex-col items-center gap-3">
        <div className="px-6 py-4 bg-gray-100 dark:bg-neutral-800 rounded-xl text-center">
          <div className="text-4xl font-bold text-gray-900 dark:text-neutral-100">
            {workCount.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 dark:text-neutral-400 mt-1">works</div>
        </div>
        <Link
          href={`/search?filter_by=${encodeURIComponent(`ror_ids:=\`${rorId}\``)}&org_labels=${encodeURIComponent(`${rorId.replace("https://ror.org/", "")}:${name}`)}`}
          className="px-4 py-2 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-neutral-200 text-white dark:text-black text-sm font-medium rounded-lg transition-colors"
        >
          Search works
        </Link>
      </div>
    </div>
  );
}
