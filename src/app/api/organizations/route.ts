import { NextRequest, NextResponse } from "next/server";
import { getTypesenseClient } from "@/lib/typesense";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const q = searchParams.get("q") || "*";
  const filterBy = searchParams.get("filter_by") || "";
  const sortBy = searchParams.get("sort_by") || "work_count:desc";
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("per_page") || "20");

  try {
    const results = await getTypesenseClient()
      .collections("institutions")
      .documents()
      .search({
        q,
        query_by: "name,acronyms,aliases,labels,city",
        filter_by: filterBy,
        sort_by: sortBy,
        facet_by: "types,country,subject_codes",
        max_facet_values: 200,
        page,
        per_page: perPage,
      });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Organizations search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
