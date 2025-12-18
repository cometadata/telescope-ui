import { NextRequest, NextResponse } from "next/server";
import { searchInstitutions } from "@/lib/typesense";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type") || "institution";

  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    if (type === "institution") {
      const results = await searchInstitutions({
        q,
        per_page: 10,
      });

      const suggestions = results.hits?.map((hit) => {
        const doc = hit.document as {
          ror_id: string;
          name: string;
          acronyms: string[];
          aliases: string[];
          city: string;
          country: string;
          work_count: number;
        };

        // Check if an acronym matched to include it in the label
        const lowerQuery = q.toLowerCase();
        const matchedAcronym = doc.acronyms?.find((a) =>
          a.toLowerCase().includes(lowerQuery)
        );

        return {
          type: "institution" as const,
          value: doc.ror_id,
          label: matchedAcronym ? `${doc.name} (${matchedAcronym})` : doc.name,
          sublabel: doc.city ? `${doc.city}, ${doc.country}` : doc.country,
          count: doc.work_count,
        };
      }) || [];

      return NextResponse.json({ suggestions });
    }

    return NextResponse.json({ suggestions: [] });
  } catch (error) {
    console.error("Autocomplete error:", error);
    return NextResponse.json({ suggestions: [] });
  }
}
