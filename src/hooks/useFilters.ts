"use client";

import { useState, useCallback, useMemo } from "react";

export interface UseFiltersOptions {
  initialCountry?: string;
  initialYear?: string;
  initialSubject?: string;
}

export interface UseFiltersReturn {
  country: string;
  year: string;
  subject: string;
  isOpen: boolean;
  setCountry: (value: string) => void;
  setYear: (value: string) => void;
  setSubject: (value: string) => void;
  setIsOpen: (value: boolean) => void;
  clear: () => void;
  activeCount: number;
  hasFilters: boolean;
}

export function useFilters(options: UseFiltersOptions = {}): UseFiltersReturn {
  const [country, setCountry] = useState(options.initialCountry ?? "");
  const [year, setYear] = useState(options.initialYear ?? "");
  const [subject, setSubject] = useState(options.initialSubject ?? "");
  const [isOpen, setIsOpen] = useState(false);

  const clear = useCallback(() => {
    setCountry("");
    setYear("");
    setSubject("");
  }, []);

  const activeCount = useMemo(
    () => [country, year, subject].filter(Boolean).length,
    [country, year, subject]
  );

  const hasFilters = activeCount > 0;

  return {
    country,
    year,
    subject,
    isOpen,
    setCountry,
    setYear,
    setSubject,
    setIsOpen,
    clear,
    activeCount,
    hasFilters,
  };
}
