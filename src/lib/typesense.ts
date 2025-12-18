import Typesense from "typesense";
import { Client } from "typesense";

function getTypesenseConfig() {
  const host = process.env.TYPESENSE_HOST;
  const apiKey = process.env.TYPESENSE_API_KEY;

  if (!host || !apiKey) {
    throw new Error(
      "Missing required environment variables: TYPESENSE_HOST and TYPESENSE_API_KEY must be set"
    );
  }

  return { host, apiKey };
}

// Server-side client (for API routes) - lazy initialization
let _client: Client | null = null;

export function getTypesenseClient(): Client {
  if (!_client) {
    const { host, apiKey } = getTypesenseConfig();
    _client = new Typesense.Client({
      nodes: [
        {
          host,
          port: 443,
          protocol: "https",
        },
      ],
      apiKey,
      connectionTimeoutSeconds: 10,
    });
  }
  return _client;
}

// Legacy export for backward compatibility
export const typesenseClient = {
  collections: (name: string) => getTypesenseClient().collections(name),
};

export interface SearchParams {
  q: string;
  query_by?: string;
  filter_by?: string;
  sort_by?: string;
  facet_by?: string;
  max_facet_values?: number;
  page?: number;
  per_page?: number;
}

export interface AuthorAffiliation {
  name: string;
  affiliations: {
    text: string;
    ror_id?: string;
    institution_name?: string;
  }[];
}

export interface WorkDocument {
  id: string;
  doi: string;
  arxiv_id: string;
  arxiv_id_link: string;
  title: string;
  year: number;
  authors: string[];
  affiliations: string[];
  ror_ids: string[];
  institution_names: string[];
  searchable_names: string[];  // All name variants (display, aliases, acronyms, labels)
  countries: string[];
  subjects: string[];
  subject_codes: string[];
  publication_link?: string;  // DOI link to published version (IsVersionOf)
  has_publication?: boolean;
  author_affiliations?: string;
}

export function parseAuthorAffiliations(work: WorkDocument): AuthorAffiliation[] {
  if (!work.author_affiliations) return [];
  try {
    return JSON.parse(work.author_affiliations);
  } catch {
    return [];
  }
}

export interface TimeSeriesPoint {
  year: number;
  count: number;
}

export interface Collaborator {
  ror_id: string;
  name: string;
  country: string;
  collaboration_count: number;
}

export interface SubjectCount {
  code: string;
  count: number;
}

export interface InstitutionDocument {
  id: string;           // ROR hash (e.g., "05x2bcf33")
  ror_id: string;       // Full ROR URL
  name: string;
  acronyms: string[];
  aliases: string[];
  labels: string[];
  country: string;
  country_code: string;
  city: string;
  types: string[];
  subject_codes: string[];  // Top research areas (faceted)
  work_count: number;
  // Complex data stored as JSON strings (not indexed)
  time_series: string;
  top_collaborators: string;
  top_subjects: string;
  links: string;
  locations: string;
}

export function parseTimeSeries(institution: InstitutionDocument): TimeSeriesPoint[] {
  if (!institution.time_series) return [];
  try {
    return JSON.parse(institution.time_series);
  } catch {
    return [];
  }
}

export function parseCollaborators(institution: InstitutionDocument): Collaborator[] {
  if (!institution.top_collaborators) return [];
  try {
    return JSON.parse(institution.top_collaborators);
  } catch {
    return [];
  }
}

export function parseSubjects(institution: InstitutionDocument): SubjectCount[] {
  if (!institution.top_subjects) return [];
  try {
    return JSON.parse(institution.top_subjects);
  } catch {
    return [];
  }
}

export function parseLinks(institution: InstitutionDocument): Array<{ type: string; value: string }> {
  if (!institution.links) return [];
  try {
    return JSON.parse(institution.links);
  } catch {
    return [];
  }
}

export function parseLocations(institution: InstitutionDocument): Array<{
  geonames_id?: number;
  geonames_details?: {
    name?: string;
    lat?: number;
    lng?: number;
    country_code?: string;
    country_name?: string;
  };
}> {
  if (!institution.locations) return [];
  try {
    return JSON.parse(institution.locations);
  } catch {
    return [];
  }
}

export async function searchWorks(params: SearchParams) {
  const searchParameters = {
    q: params.q || "*",
    query_by: params.query_by || "title,authors,searchable_names,affiliations,arxiv_id,doi",
    filter_by: params.filter_by || "",
    sort_by: params.sort_by || "_text_match:desc,year:desc",
    facet_by: params.facet_by || "year,subject_codes,countries,has_publication",
    max_facet_values: params.max_facet_values || 200,
    page: params.page || 1,
    per_page: params.per_page || 20,
  };

  return typesenseClient.collections("works").documents().search(searchParameters);
}

export const worksSchema = {
  name: "works",
  fields: [
    { name: "id", type: "string" as const },
    { name: "doi", type: "string" as const },
    { name: "arxiv_id", type: "string" as const },
    { name: "arxiv_id_link", type: "string" as const },
    { name: "title", type: "string" as const },
    { name: "year", type: "int32" as const, facet: true },
    { name: "authors", type: "string[]" as const },
    { name: "affiliations", type: "string[]" as const },
    { name: "ror_ids", type: "string[]" as const, facet: true },
    { name: "institution_names", type: "string[]" as const },
    { name: "searchable_names", type: "string[]" as const },
    { name: "countries", type: "string[]" as const, facet: true },
    { name: "subjects", type: "string[]" as const },
    { name: "subject_codes", type: "string[]" as const, facet: true },
    { name: "publication_link", type: "string" as const, optional: true },
    { name: "has_publication", type: "bool" as const, facet: true },
    { name: "author_affiliations", type: "string" as const, index: false },
  ],
  default_sorting_field: "year",
};

export const institutionsSchema = {
  name: "institutions",
  fields: [
    { name: "id", type: "string" as const },
    { name: "ror_id", type: "string" as const },
    { name: "name", type: "string" as const },
    { name: "acronyms", type: "string[]" as const },
    { name: "aliases", type: "string[]" as const },
    { name: "labels", type: "string[]" as const },
    { name: "country", type: "string" as const, facet: true },
    { name: "country_code", type: "string" as const },
    { name: "city", type: "string" as const },
    { name: "types", type: "string[]" as const, facet: true },
    { name: "subject_codes", type: "string[]" as const, facet: true },
    { name: "work_count", type: "int32" as const },
    { name: "time_series", type: "string" as const, index: false },
    { name: "top_collaborators", type: "string" as const, index: false },
    { name: "top_subjects", type: "string" as const, index: false },
    { name: "links", type: "string" as const, index: false },
    { name: "locations", type: "string" as const, index: false },
  ],
  default_sorting_field: "work_count",
};

export async function searchInstitutions(params: {
  q: string;
  filter_by?: string;
  sort_by?: string;
  page?: number;
  per_page?: number;
}) {
  const searchParameters = {
    q: params.q || "*",
    query_by: "name,acronyms,aliases,labels,city",
    filter_by: params.filter_by || "",
    sort_by: params.sort_by || "_text_match:desc,work_count:desc",
    page: params.page || 1,
    per_page: params.per_page || 20,
  };

  return getTypesenseClient().collections("institutions").documents().search(searchParameters);
}

export async function getInstitutionByRor(rorHash: string): Promise<InstitutionDocument | null> {
  try {
    const doc = await getTypesenseClient()
      .collections("institutions")
      .documents(rorHash)
      .retrieve();
    return doc as InstitutionDocument;
  } catch {
    return null;
  }
}
