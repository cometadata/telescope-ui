import { promises as fs } from "fs";
import path from "path";
import type { GlobalStats, OrganizationSummary, YearData, CountryData } from "@/types";

const STATS_DIR = path.join(process.cwd(), "public", "data", "stats");

async function readStatsFile<T>(fileName: string): Promise<T | null> {
  try {
    const fullPath = path.join(STATS_DIR, fileName);
    const data = await fs.readFile(fullPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${fileName}:`, error);
    return null;
  }
}

export async function getGlobalStats(): Promise<GlobalStats | null> {
  return readStatsFile<GlobalStats>("global-stats.json");
}

export async function getTopOrganizations(
  limit?: number
): Promise<OrganizationSummary[]> {
  const data = await readStatsFile<OrganizationSummary[]>(
    "top-institutions.json"
  );
  if (!data) return [];
  return limit ? data.slice(0, limit) : data;
}

export async function getStatsByYear(): Promise<YearData[]> {
  const data = await readStatsFile<YearData[]>("by-year.json");
  return data || [];
}

export async function getStatsByCountry(): Promise<CountryData[]> {
  const data = await readStatsFile<CountryData[]>("by-country.json");
  return data || [];
}

export interface SubjectTrends {
  [subjectCode: string]: YearData[];
}

export async function getSubjectTrends(): Promise<SubjectTrends> {
  const data = await readStatsFile<SubjectTrends>("subject-trends.json");
  return data || {};
}
