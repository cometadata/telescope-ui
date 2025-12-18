import { NextResponse } from "next/server";
import { fetchSubjectTrends } from "@/lib/stats-queries";

// ISR configuration - on-demand revalidation only
export const dynamic = "force-static";
export const revalidate = false;

export async function GET() {
  try {
    const trends = await fetchSubjectTrends(50);

    return NextResponse.json(trends, {
      headers: {
        "Cache-Control": "public, s-maxage=31536000",
      },
    });
  } catch (error) {
    console.error("Failed to fetch subject trends:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
