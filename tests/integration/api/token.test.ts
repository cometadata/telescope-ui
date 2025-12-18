import { describe, it, expect, beforeEach } from "vitest";
import { GET } from "@/app/api/token/route";
import { NextRequest } from "next/server";

describe("GET /api/token", () => {
  beforeEach(() => {
    process.env.REQUEST_TOKEN_SECRET = "test-secret-for-integration-tests";
  });

  function createRequest(headers: Record<string, string> = {}): NextRequest {
    return new NextRequest("http://localhost:3000/api/token", {
      headers: new Headers(headers),
    });
  }

  it("should return a token with valid referer", async () => {
    const request = createRequest({
      referer: "http://localhost:3000/search",
    });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.token).toBeDefined();
    expect(typeof data.token).toBe("string");
    expect(data.expiresIn).toBe(300); // 5 minutes in seconds
  });

  it("should reject request without referer", async () => {
    const request = createRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Invalid request origin");
  });

  it("should reject request with external referer", async () => {
    const request = createRequest({
      referer: "http://evil.com/",
    });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Invalid request origin");
  });
});
