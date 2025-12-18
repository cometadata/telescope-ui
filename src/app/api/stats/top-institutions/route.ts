import { NextResponse } from "next/server";
import { fetchTopInstitutions } from "@/lib/stats-queries";

// ISR configuration - on-demand revalidation only
export const dynamic = "force-static";
export const revalidate = false;

export async function GET() {
  try {
    const institutions = await fetchTopInstitutions(100);

    return NextResponse.json(institutions, {
      headers: {
        "Cache-Control": "public, s-maxage=31536000",
      },
    });
  } catch (error) {
    console.error("Failed to fetch top institutions:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
