import { promises as fs } from "fs";
import path from "path";
import type { GlobalStats, OrganizationSummary, YearData, CountryData } from "@/types";

const DATA_DIR = path.join(process.cwd(), "public", "data");

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const fullPath = path.join(DATA_DIR, filePath);
    const data = await fs.readFile(fullPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return null;
  }
}

export async function getGlobalStats(): Promise<GlobalStats | null> {
  return readJsonFile<GlobalStats>("stats/global-stats.json");
}

export async function getTopOrganizations(
  limit?: number
): Promise<OrganizationSummary[]> {
  const data = await readJsonFile<OrganizationSummary[]>(
    "stats/top-institutions.json"
  );
  if (!data) return [];
  return limit ? data.slice(0, limit) : data;
}

export async function getStatsByYear(): Promise<YearData[]> {
  const data = await readJsonFile<YearData[]>("stats/by-year.json");
  return data || [];
}

export async function getStatsByCountry(): Promise<CountryData[]> {
  const data = await readJsonFile<CountryData[]>("stats/by-country.json");
  return data || [];
}

export interface SubjectTrend {
  subject: string;
  count: number;
}

export async function getSubjectTrends(): Promise<SubjectTrend[]> {
  const data = await readJsonFile<SubjectTrend[]>("stats/subject-trends.json");
  return data || [];
}
