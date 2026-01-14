import { NextRequest, NextResponse } from "next/server";

// Stats API routes now read from static JSON files in public/data/stats/.
// Revalidation happens automatically when new data files are deployed.
// This endpoint is kept for backwards compatibility but is effectively a no-op.

export async function POST(request: NextRequest) {
  const token = process.env.STATS_REVALIDATION_TOKEN;

  if (token) {
    const authHeader = request.headers.get("authorization");
    const providedToken = authHeader?.replace("Bearer ", "");

    if (providedToken !== token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  }

  return NextResponse.json({
    success: true,
    message: "Stats are served from static files. Update public/data/stats/*.json and redeploy to refresh data.",
    timestamp: new Date().toISOString(),
  });
}
