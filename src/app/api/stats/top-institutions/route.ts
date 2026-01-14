import { NextResponse } from "next/server";
import { getTopOrganizations } from "@/lib/data";

export async function GET() {
  try {
    const institutions = await getTopOrganizations(100);

    return NextResponse.json(institutions, {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
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
