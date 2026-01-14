import { NextResponse } from "next/server";
import { getStatsByCountry } from "@/lib/data";

export async function GET() {
  try {
    const countryData = await getStatsByCountry();

    return NextResponse.json(countryData, {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
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
