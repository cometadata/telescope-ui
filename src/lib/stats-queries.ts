import { getTypesenseClient, InstitutionDocument } from "./typesense";

export interface GlobalStats {
  total_works: number;
  total_institutions: number;
  total_countries: number;
  year_range: { min: number; max: number };
  generated_at: string;
}

export interface YearData {
  year: number;
  count: number;
}

export interface CountryData {
  country: string;
  work_count: number;
}

export interface TopInstitution {
  ror_id: string;
  name: string;
  aliases: string[];
  acronyms: string[];
  labels: string[];
  city: string;
  country: string;
  work_count: number;
}

export interface SubjectTrends {
  [subjectCode: string]: YearData[];
}

export async function fetchGlobalStats(): Promise<GlobalStats> {
  const client = getTypesenseClient();

  const [worksCollection, institutionsCollection, yearFacet, countriesFacet] =
    await Promise.all([
      client.collections("works").retrieve(),
      client.collections("institutions").retrieve(),
      client
        .collections("works")
        .documents()
        .search({
          q: "*",
          query_by: "title",
          per_page: 0,
          facet_by: "year",
          max_facet_values: 100,
        }),
      client
        .collections("institutions")
        .documents()
        .search({
          q: "*",
          query_by: "name",
          per_page: 0,
          facet_by: "country",
          max_facet_values: 250,
        }),
    ]);

  const yearCounts = yearFacet.facet_counts?.[0]?.counts || [];
  const years = yearCounts
    .map((c) => Number(c.value))
    .filter((y) => !isNaN(y));

  return {
    total_works: worksCollection.num_documents,
    total_institutions: institutionsCollection.num_documents,
    total_countries: countriesFacet.facet_counts?.[0]?.stats?.total_values ?? 0,
    year_range: {
      min: years.length > 0 ? Math.min(...years) : 0,
      max: years.length > 0 ? Math.max(...years) : 0,
    },
    generated_at: new Date().toISOString(),
  };
}

export async function fetchByYear(): Promise<YearData[]> {
  const client = getTypesenseClient();

  const result = await client
    .collections("works")
    .documents()
    .search({
      q: "*",
      query_by: "title",
      per_page: 0,
      facet_by: "year",
      max_facet_values: 100,
    });

  const yearCounts = result.facet_counts?.[0]?.counts || [];

  return yearCounts
    .map((c) => ({
      year: Number(c.value),
      count: c.count,
    }))
    .filter((y) => !isNaN(y.year))
    .sort((a, b) => a.year - b.year);
}

export async function fetchByCountry(): Promise<CountryData[]> {
  const client = getTypesenseClient();

  const result = await client
    .collections("works")
    .documents()
    .search({
      q: "*",
      query_by: "title",
      per_page: 0,
      facet_by: "countries",
      max_facet_values: 250,
    });

  const countryCounts = result.facet_counts?.[0]?.counts || [];

  return countryCounts
    .map((c) => ({
      country: String(c.value),
      work_count: c.count,
    }))
    .sort((a, b) => b.work_count - a.work_count);
}

export async function fetchTopInstitutions(
  limit: number = 100
): Promise<TopInstitution[]> {
  const client = getTypesenseClient();

  const result = await client
    .collections("institutions")
    .documents()
    .search({
      q: "*",
      query_by: "name",
      sort_by: "work_count:desc",
      per_page: limit,
    });

  return (result.hits || []).map((hit) => {
    const doc = hit.document as InstitutionDocument;
    return {
      ror_id: doc.ror_id,
      name: doc.name,
      aliases: doc.aliases || [],
      acronyms: doc.acronyms || [],
      labels: doc.labels || [],
      city: doc.city,
      country: doc.country,
      work_count: doc.work_count,
    };
  });
}

// Batched parallel queries to avoid overwhelming Typesense
export async function fetchSubjectTrends(topN: number = 50): Promise<SubjectTrends> {
  const client = getTypesenseClient();

  // Step 1: Get top subjects by total count
  const topSubjectsResult = await client
    .collections("works")
    .documents()
    .search({
      q: "*",
      query_by: "title",
      per_page: 0,
      facet_by: "subject_codes",
      max_facet_values: topN,
    });

  const topSubjects = topSubjectsResult.facet_counts?.[0]?.counts || [];
  const subjectCodes = topSubjects.map((c) => String(c.value));

  // Step 2: For each subject, query year distribution (batched to limit concurrent requests)
  const BATCH_SIZE = 10;
  const trends: SubjectTrends = {};

  for (let i = 0; i < subjectCodes.length; i += BATCH_SIZE) {
    const batch = subjectCodes.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.all(
      batch.map(async (code) => {
        const result = await client
          .collections("works")
          .documents()
          .search({
            q: "*",
            query_by: "title",
            filter_by: `subject_codes:=\`${code}\``,
            per_page: 0,
            facet_by: "year",
            max_facet_values: 100,
          });

        const yearCounts = result.facet_counts?.[0]?.counts || [];
        return {
          code,
          data: yearCounts
            .map((c) => ({ year: Number(c.value), count: c.count }))
            .filter((y) => !isNaN(y.year))
            .sort((a, b) => a.year - b.year),
        };
      })
    );

    for (const { code, data } of batchResults) {
      trends[code] = data;
    }
  }

  return trends;
}
