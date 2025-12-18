import { http, HttpResponse } from "msw";
import { mockSearchResponse } from "./fixtures/works";
import { mockInstitution, mockInstitutionsSearchResponse } from "./fixtures/institutions";
import { mockGlobalStats, mockByYearStats, mockTopInstitutions, mockByCountryStats } from "./fixtures/stats";

const BASE_URL = "http://localhost:3000";

export const handlers = [
  // Token API
  http.get(`${BASE_URL}/api/token`, () => {
    return HttpResponse.json({
      token: "test-token-12345",
      expiresIn: 300,
    });
  }),

  // Static data files
  http.get(`${BASE_URL}/data/stats/by-year.json`, () => {
    return HttpResponse.json(mockByYearStats);
  }),

  http.get(`${BASE_URL}/data/stats/by-country.json`, () => {
    return HttpResponse.json(mockByCountryStats.map(c => ({
      country: c.country,
      work_count: c.count,
    })));
  }),

  // Search API
  http.get(`${BASE_URL}/api/search`, ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") || "*";
    const page = parseInt(url.searchParams.get("page") || "1");
    const perPage = parseInt(url.searchParams.get("per_page") || "20");

    // Return empty results for specific test query
    if (q === "no-results-query") {
      return HttpResponse.json({
        found: 0,
        hits: [],
        facet_counts: [],
        page,
        out_of: 0,
      });
    }

    return HttpResponse.json({
      ...mockSearchResponse,
      page,
      request_params: { per_page: perPage },
    });
  }),

  // Autocomplete API
  http.get(`${BASE_URL}/api/autocomplete`, ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") || "";

    if (!q || q.length < 2) {
      return HttpResponse.json({ suggestions: [] });
    }

    // Return suggestions in the format FieldedSearchBar expects
    return HttpResponse.json({
      suggestions: [
        {
          type: "institution",
          value: "https://ror.org/05x2bcf33",
          label: "Massachusetts Institute of Technology",
          sublabel: "United States",
          count: 15000,
        },
        {
          type: "institution",
          value: "https://ror.org/03vek6s52",
          label: "Harvard University",
          sublabel: "United States",
          count: 12000,
        },
      ],
    });
  }),

  // Institution by ROR
  http.get(`${BASE_URL}/api/institutions/:ror`, ({ params }) => {
    const { ror } = params;

    if (ror === "unknown-ror") {
      return HttpResponse.json({ error: "Institution not found" }, { status: 404 });
    }

    return HttpResponse.json(mockInstitution);
  }),

  // Organizations list
  http.get(`${BASE_URL}/api/organizations`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");

    return HttpResponse.json({
      ...mockInstitutionsSearchResponse,
      page,
    });
  }),

  // Stats: Global
  http.get(`${BASE_URL}/api/stats/global`, () => {
    return HttpResponse.json(mockGlobalStats);
  }),

  // Stats: By Year
  http.get(`${BASE_URL}/api/stats/by-year`, () => {
    return HttpResponse.json(mockByYearStats);
  }),

  // Stats: Top Institutions
  http.get(`${BASE_URL}/api/stats/top-institutions`, () => {
    return HttpResponse.json(mockTopInstitutions);
  }),

  // Stats: By Country
  http.get(`${BASE_URL}/api/stats/by-country`, () => {
    return HttpResponse.json([
      { country: "United States", count: 50000 },
      { country: "China", count: 30000 },
      { country: "United Kingdom", count: 15000 },
    ]);
  }),

  // Stats: Subject Trends
  http.get(`${BASE_URL}/api/stats/subject-trends`, () => {
    return HttpResponse.json([
      { code: "cs.AI", name: "Artificial Intelligence", count: 10000 },
      { code: "cs.LG", name: "Machine Learning", count: 8000 },
      { code: "physics.hep-th", name: "High Energy Physics - Theory", count: 5000 },
    ]);
  }),
];
