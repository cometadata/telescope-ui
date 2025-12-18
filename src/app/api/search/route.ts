import { NextRequest, NextResponse } from "next/server";
import { searchWorks } from "@/lib/typesense";
import {
  parseIntClamped,
  sanitizeString,
  handleAPIError,
  badRequest,
} from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const q = sanitizeString(searchParams.get("q"), 500);
  const page = parseIntClamped(searchParams.get("page"), 1, 1, 100); // Reduced from 1000
  const per_page = parseIntClamped(searchParams.get("per_page"), 20, 1, 50); // Reduced from 100
  const filter_by = sanitizeString(searchParams.get("filter_by"), 2000);
  const sort_by = sanitizeString(searchParams.get("sort_by"), 200);
  const facet_by = sanitizeString(searchParams.get("facet_by"), 500);
  const max_facet_values = parseIntClamped(
    searchParams.get("max_facet_values"),
    200,
    1,
    500
  );

  // Allow wildcard queries only when filters are present (for browsing filtered results)
  // Block empty/wildcard queries without filters (prevents full index scan)
  if (!q || q === "*") {
    if (!filter_by) {
      return badRequest("Please enter a search term or apply filters");
    }
    // When filters are present, allow browsing with wildcard
  } else if (q.length < 2) {
    return badRequest("Search term must be at least 2 characters");
  }

  try {
    const results = await searchWorks({
      q,
      page,
      per_page,
      filter_by,
      sort_by,
      facet_by: facet_by || undefined,
      max_facet_values,
    });

    // Optionally hide total count for deep pagination (anti-scraping)
    const response = { ...results };
    if (page > 10 && results.found > 1000) {
      // Replace exact count with "many" indicator for deep pages
      response.found = -1; // Frontend can display "1000+" or similar
    }

    return NextResponse.json(response);
  } catch (error) {
    return handleAPIError(error, "Search works");
  }
}
