import { NextResponse } from "next/server";
import { getSubjectTrends } from "@/lib/data";

export async function GET() {
  try {
    const trends = await getSubjectTrends();

    return NextResponse.json(trends, {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
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
