import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/request-token", () => ({
  validateToken: vi.fn().mockResolvedValue({ valid: true }),
}));

describe("middleware", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.REQUEST_TOKEN_SECRET = "test-secret";
  });

  function createRequest(
    path: string,
    headers: Record<string, string> = {}
  ): NextRequest {
    return new NextRequest(`http://localhost:3000${path}`, {
      headers: new Headers({
        "user-agent": "Mozilla/5.0 Test Browser",
        ...headers,
      }),
    });
  }

  it("should allow requests to non-API routes", async () => {
    const { middleware } = await import("../../middleware");
    const request = createRequest("/search");
    const response = await middleware(request);

    // NextResponse.next() returns undefined or a response that continues
    expect(response?.status).not.toBe(403);
    expect(response?.status).not.toBe(429);
  });

  it("should allow requests to /api/token without token", async () => {
    const { middleware } = await import("../../middleware");
    const request = createRequest("/api/token");
    const response = await middleware(request);

    expect(response?.status).not.toBe(403);
  });

  it("should reject /api/search without token", async () => {
    const { validateToken } = await import("@/lib/request-token");
    vi.mocked(validateToken).mockResolvedValue({ valid: false, error: "Token required" });

    const { middleware } = await import("../../middleware");
    const request = createRequest("/api/search?q=test");
    const response = await middleware(request);

    expect(response?.status).toBe(403);
  });

  it("should reject requests without User-Agent", async () => {
    const { middleware } = await import("../../middleware");
    const request = new NextRequest("http://localhost:3000/api/search?q=test", {
      headers: new Headers({
        "x-request-token": "valid-token",
      }),
    });
    const response = await middleware(request);

    expect(response?.status).toBe(403);
  });

  it("should reject requests with invalid origin", async () => {
    const { middleware } = await import("../../middleware");
    const request = createRequest("/api/search?q=test", {
      "x-request-token": "valid-token",
      "origin": "http://evil.com",
    });
    const response = await middleware(request);

    expect(response?.status).toBe(403);
    const body = await response?.json();
    expect(body).toEqual({ error: "Invalid origin" });
  });

  it("should allow valid requests with token", async () => {
    const { validateToken } = await import("@/lib/request-token");
    vi.mocked(validateToken).mockResolvedValue({ valid: true });

    const { middleware } = await import("../../middleware");
    const request = createRequest("/api/search?q=test", {
      "x-request-token": "valid-token",
    });
    const response = await middleware(request);

    expect(response?.status).not.toBe(403);
  });
});
