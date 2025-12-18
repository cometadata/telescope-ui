import { NextResponse } from "next/server";
import { fetchGlobalStats } from "@/lib/stats-queries";

// Backward compatibility: this route now delegates to fetchGlobalStats
// but returns the legacy format (without year_range and generated_at)
export async function GET() {
  try {
    const stats = await fetchGlobalStats();

    return NextResponse.json({
      total_works: stats.total_works,
      total_institutions: stats.total_institutions,
      total_countries: stats.total_countries,
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
