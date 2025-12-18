import type { InstitutionDocument } from "@/lib/typesense";

export const mockInstitution: InstitutionDocument = {
  id: "05x2bcf33",
  ror_id: "https://ror.org/05x2bcf33",
  name: "Massachusetts Institute of Technology",
  acronyms: ["MIT"],
  aliases: [],
  labels: [],
  country: "United States",
  country_code: "US",
  city: "Cambridge",
  types: ["Education", "Funder"],
  subject_codes: ["cs.LG", "cs.AI", "physics.hep-th"],
  work_count: 15000,
  time_series: JSON.stringify([
    { year: 2020, count: 2500 },
    { year: 2021, count: 2800 },
    { year: 2022, count: 3200 },
    { year: 2023, count: 3500 },
    { year: 2024, count: 3000 },
  ]),
  top_collaborators: JSON.stringify([
    { ror_id: "https://ror.org/03vek6s52", name: "Harvard University", country: "United States", collaboration_count: 500 },
    { ror_id: "https://ror.org/00f54p054", name: "Stanford University", country: "United States", collaboration_count: 350 },
    { ror_id: "https://ror.org/052gg0110", name: "University of Oxford", country: "United Kingdom", collaboration_count: 200 },
  ]),
  top_subjects: JSON.stringify([
    { code: "cs.LG", count: 3000 },
    { code: "cs.AI", count: 2500 },
    { code: "physics.hep-th", count: 1500 },
  ]),
  links: JSON.stringify([
    { type: "website", value: "https://www.mit.edu" },
    { type: "wikipedia", value: "https://en.wikipedia.org/wiki/Massachusetts_Institute_of_Technology" },
  ]),
  locations: JSON.stringify([
    {
      geonames_id: 4931972,
      geonames_details: {
        name: "Cambridge",
        lat: 42.3736,
        lng: -71.1097,
        country_code: "US",
        country_name: "United States",
      },
    },
  ]),
};

export const mockInstitutions: InstitutionDocument[] = [
  mockInstitution,
  {
    id: "03vek6s52",
    ror_id: "https://ror.org/03vek6s52",
    name: "Harvard University",
    acronyms: [],
    aliases: ["Harvard"],
    labels: [],
    country: "United States",
    country_code: "US",
    city: "Cambridge",
    types: ["Education"],
    subject_codes: ["cs.LG", "q-bio", "stat.ML"],
    work_count: 12000,
    time_series: JSON.stringify([
      { year: 2020, count: 2200 },
      { year: 2021, count: 2400 },
      { year: 2022, count: 2600 },
      { year: 2023, count: 2800 },
      { year: 2024, count: 2000 },
    ]),
    top_collaborators: JSON.stringify([
      { ror_id: "https://ror.org/05x2bcf33", name: "Massachusetts Institute of Technology", country: "United States", collaboration_count: 500 },
    ]),
    top_subjects: JSON.stringify([
      { code: "cs.LG", count: 2000 },
      { code: "q-bio", count: 1500 },
    ]),
    links: JSON.stringify([
      { type: "website", value: "https://www.harvard.edu" },
    ]),
    locations: JSON.stringify([]),
  },
  {
    id: "00f54p054",
    ror_id: "https://ror.org/00f54p054",
    name: "Stanford University",
    acronyms: [],
    aliases: ["Stanford"],
    labels: [],
    country: "United States",
    country_code: "US",
    city: "Stanford",
    types: ["Education"],
    subject_codes: ["cs.AI", "cs.LG", "cs.CL"],
    work_count: 11000,
    time_series: JSON.stringify([]),
    top_collaborators: JSON.stringify([]),
    top_subjects: JSON.stringify([]),
    links: JSON.stringify([]),
    locations: JSON.stringify([]),
  },
];

export const mockInstitutionsSearchResponse = {
  found: 3,
  hits: mockInstitutions.map((inst) => ({
    document: inst,
    highlights: [],
    text_match: 100,
  })),
  facet_counts: [
    {
      field_name: "country",
      counts: [{ value: "United States", count: 3 }],
    },
    {
      field_name: "types",
      counts: [
        { value: "Education", count: 3 },
        { value: "Funder", count: 1 },
      ],
    },
  ],
  page: 1,
  out_of: 3,
};
