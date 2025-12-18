import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/lib/request-token";
import { logger } from "@/lib/logger";

// Routes that require token validation
const PROTECTED_ROUTES = ["/api/search", "/api/autocomplete"];

// Routes exempt from token validation
const TOKEN_EXEMPT_ROUTES = ["/api/token"];

// All API routes for basic checks
const API_PREFIX = "/api/";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip non-API routes
  if (!pathname.startsWith(API_PREFIX)) {
    return NextResponse.next();
  }

  // Skip token endpoint
  if (TOKEN_EXEMPT_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Block requests without User-Agent (likely bots)
  const userAgent = request.headers.get("user-agent");
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ??
             request.headers.get("x-real-ip") ??
             "anonymous";

  if (!userAgent || userAgent.trim() === "") {
    logger.warn("blocked_request", { reason: "missing_user_agent", ip });
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 403 }
    );
  }

  // Validate Origin header if present (CORS preflight already handled by Next.js)
  const origin = request.headers.get("origin");
  if (origin) {
    const allowedOrigins = [
      // Local development
      "http://localhost:3000",
      "http://localhost:3001",
      // Production/custom domain (set NEXT_PUBLIC_APP_URL environment variable)
      process.env.NEXT_PUBLIC_APP_URL,
    ].filter(Boolean);

    // Check exact matches
    let isAllowed = allowedOrigins.includes(origin);

    // Check for Vercel preview deployments (*.vercel.app)
    if (!isAllowed) {
      try {
        const originUrl = new URL(origin);
        isAllowed = originUrl.hostname.endsWith('.vercel.app');
      } catch {
        // Invalid origin URL
        isAllowed = false;
      }
    }

    if (!isAllowed) {
      logger.warn("blocked_request", { reason: "invalid_origin", ip, origin });
      return NextResponse.json(
        { error: "Invalid origin" },
        { status: 403 }
      );
    }
  }

  // Check token for protected routes
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    const token = request.headers.get("x-request-token");
    const validation = await validateToken(token || "");

    if (!validation.valid) {
      logger.warn("token_invalid", { ip, error: validation.error });
      return NextResponse.json(
        { error: validation.error || "Invalid token" },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
