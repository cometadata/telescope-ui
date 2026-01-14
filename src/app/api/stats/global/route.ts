import { NextResponse } from "next/server";
import { getGlobalStats } from "@/lib/data";

export async function GET() {
  try {
    const stats = await getGlobalStats();

    if (!stats) {
      return NextResponse.json(
        { error: "Stats data not available" },
        { status: 404 }
      );
    }

    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("Failed to fetch global stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
