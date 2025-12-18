import { NextRequest, NextResponse } from "next/server";
import { generateToken } from "@/lib/request-token";

const ALLOWED_HOSTS = [
  // Local development
  "localhost:3000",
  "localhost:3001",
  // Production/custom domain (set NEXT_PUBLIC_APP_URL environment variable)
  process.env.NEXT_PUBLIC_APP_URL,
  // Vercel preview deployments (*.vercel.app)
  // Note: Wildcard pattern matching is handled in isValidOrigin function below
].filter(Boolean);

function isValidOrigin(referer: string | null): boolean {
  if (!referer) return false;

  try {
    const url = new URL(referer);
    const host = url.host || url.hostname;

    // Check exact matches
    if (ALLOWED_HOSTS.some((allowedHost) => host === allowedHost)) {
      return true;
    }

    if (url.hostname.endsWith('.vercel.app')) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const referer = request.headers.get("referer");

  if (!isValidOrigin(referer)) {
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 }
    );
  }

  const token = await generateToken();

  return NextResponse.json({
    token,
    expiresIn: 300, // 5 minutes in seconds
  });
}
