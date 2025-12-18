import type {
  WorkDocument,
  InstitutionDocument,
  SearchParams,
  AuthorAffiliation,
  TimeSeriesPoint,
  Collaborator,
  SubjectCount,
} from "@/lib/typesense";

export type {
  WorkDocument,
  InstitutionDocument,
  SearchParams,
  AuthorAffiliation,
  TimeSeriesPoint,
  Collaborator,
  SubjectCount,
};

export {
  parseAuthorAffiliations,
  parseTimeSeries,
  parseCollaborators,
  parseSubjects,
  parseLinks,
  parseLocations,
} from "@/lib/typesense";

export interface GlobalStats {
  total_works: number;
  total_institutions: number;
  total_countries: number;
  year_range: { min: number; max: number };
}

export interface OrganizationSummary {
  ror_id: string;
  name: string;
  city?: string;
  country: string;
  work_count: number;
}

export interface YearData {
  year: number;
  count: number;
}

export interface CountryData {
  country: string;
  work_count: number;
}

export interface WorkHit {
  document: WorkDocument;
}

export interface FacetCount {
  value: string;
  count: number;
}

export interface SearchResults {
  found: number;
  hits: WorkHit[];
  facet_counts?: {
    field_name: string;
    counts: FacetCount[];
  }[];
  page: number;
}

export interface OrganizationData {
  ror_id: string;
  name: string;
  country: string;
  country_code: string;
  types: string[];
  work_count: number;
  time_series: TimeSeriesPoint[];
  top_collaborators: Collaborator[];
  top_subjects: SubjectCount[];
  links: { type: string; value: string }[];
  locations: {
    geonames_details?: {
      name?: string;
      country_name?: string;
    };
  }[];
}

export interface FilterState {
  country: string;
  year: string;
  subject: string;
}
