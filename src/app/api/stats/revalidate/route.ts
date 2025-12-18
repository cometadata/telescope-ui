import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

const STATS_PATHS = [
  "/api/stats/global",
  "/api/stats/by-year",
  "/api/stats/by-country",
  "/api/stats/top-institutions",
  "/api/stats/subject-trends",
];

export async function POST(request: NextRequest) {
  const token = process.env.STATS_REVALIDATION_TOKEN;

  if (!token) {
    console.error("STATS_REVALIDATION_TOKEN not configured");
    return NextResponse.json(
      { error: "Revalidation not configured" },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization");
  const providedToken = authHeader?.replace("Bearer ", "");

  if (providedToken !== token) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  let body: { paths?: string[] } = {};
  try {
    body = await request.json();
  } catch {
    // Empty body is fine - revalidate all
  }

  const pathsToRevalidate =
    body.paths && body.paths.length > 0 ? body.paths : STATS_PATHS;

  try {
    const results: Record<string, boolean> = {};

    for (const path of pathsToRevalidate) {
      if (STATS_PATHS.includes(path)) {
        revalidatePath(path);
        results[path] = true;
      } else {
        results[path] = false;
      }
    }

    return NextResponse.json({
      success: true,
      revalidated: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Revalidation failed:", error);
    return NextResponse.json(
      { error: "Revalidation failed" },
      { status: 500 }
    );
  }
}
