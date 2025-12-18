export const mockGlobalStats = {
  total_works: 150000,
  total_institutions: 5000,
  total_countries: 120,
  total_subjects: 156,
  date_range: {
    min: 2010,
    max: 2024,
  },
};

export const mockByYearStats = [
  { year: 2020, count: 25000 },
  { year: 2021, count: 28000 },
  { year: 2022, count: 32000 },
  { year: 2023, count: 38000 },
  { year: 2024, count: 27000 },
];

export const mockTopInstitutions = [
  {
    rank: 1,
    ror_id: "https://ror.org/05x2bcf33",
    name: "Massachusetts Institute of Technology",
    country: "United States",
    work_count: 15000,
  },
  {
    rank: 2,
    ror_id: "https://ror.org/03vek6s52",
    name: "Harvard University",
    country: "United States",
    work_count: 12000,
  },
  {
    rank: 3,
    ror_id: "https://ror.org/00f54p054",
    name: "Stanford University",
    country: "United States",
    work_count: 11000,
  },
  {
    rank: 4,
    ror_id: "https://ror.org/052gg0110",
    name: "University of Oxford",
    country: "United Kingdom",
    work_count: 9500,
  },
  {
    rank: 5,
    ror_id: "https://ror.org/05a28rw58",
    name: "ETH Zurich",
    country: "Switzerland",
    work_count: 8000,
  },
  {
    rank: 6,
    ror_id: "https://ror.org/02e7b5302",
    name: "University of Cambridge",
    country: "United Kingdom",
    work_count: 7500,
  },
  {
    rank: 7,
    ror_id: "https://ror.org/01cwqze88",
    name: "Tsinghua University",
    country: "China",
    work_count: 7000,
  },
  {
    rank: 8,
    ror_id: "https://ror.org/02v51f717",
    name: "Peking University",
    country: "China",
    work_count: 6500,
  },
  {
    rank: 9,
    ror_id: "https://ror.org/04aj4c181",
    name: "University of Tokyo",
    country: "Japan",
    work_count: 6000,
  },
  {
    rank: 10,
    ror_id: "https://ror.org/04gyf1771",
    name: "Max Planck Society",
    country: "Germany",
    work_count: 5500,
  },
];

export const mockByCountryStats = [
  { country: "United States", count: 50000 },
  { country: "China", count: 30000 },
  { country: "United Kingdom", count: 15000 },
  { country: "Germany", count: 12000 },
  { country: "Japan", count: 8000 },
];

export const mockSubjectTrendsStats = [
  { code: "cs.AI", name: "Artificial Intelligence", count: 10000 },
  { code: "cs.LG", name: "Machine Learning", count: 8000 },
  { code: "physics.hep-th", name: "High Energy Physics - Theory", count: 5000 },
  { code: "cs.CL", name: "Computation and Language", count: 4500 },
  { code: "quant-ph", name: "Quantum Physics", count: 4000 },
];
