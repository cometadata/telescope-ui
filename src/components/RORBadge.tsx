"use client";

import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";

interface RORBadgeProps {
  rorId: string;
}

export function RORBadge({ rorId }: RORBadgeProps) {
  const { resolvedTheme } = useTheme();
  // Ensure we have a full URL
  const rorUrl = rorId.startsWith("https://") ? rorId : `https://ror.org/${rorId}`;

  return (
    <a
      href={rorUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center hover:opacity-70 transition-opacity flex-shrink-0"
    >
      <Image
        src={resolvedTheme === "dark" ? "/inverted-ror.svg" : "/ror.svg"}
        alt="ROR"
        width={40}
        height={18}
        className={resolvedTheme === undefined ? "opacity-0" : "opacity-100"}
      />
    </a>
  );
}
