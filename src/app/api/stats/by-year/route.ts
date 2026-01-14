import { NextResponse } from "next/server";
import { getStatsByYear } from "@/lib/data";

export async function GET() {
  try {
    const yearData = await getStatsByYear();

    return NextResponse.json(yearData, {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("Failed to fetch by-year stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
