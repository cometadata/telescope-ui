import { NextResponse } from "next/server";
import { fetchByCountry } from "@/lib/stats-queries";

// ISR configuration - on-demand revalidation only
export const dynamic = "force-static";
export const revalidate = false;

export async function GET() {
  try {
    const countryData = await fetchByCountry();

    return NextResponse.json(countryData, {
      headers: {
        "Cache-Control": "public, s-maxage=31536000",
      },
    });
  } catch (error) {
    console.error("Failed to fetch by-country stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
