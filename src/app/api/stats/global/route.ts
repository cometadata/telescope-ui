import { NextResponse } from "next/server";
import { fetchGlobalStats } from "@/lib/stats-queries";

// ISR configuration - on-demand revalidation only
export const dynamic = "force-static";
export const revalidate = false;

export async function GET() {
  try {
    const stats = await fetchGlobalStats();

    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "public, s-maxage=31536000",
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
