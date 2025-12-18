import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("request-token", () => {
  const TEST_SECRET = "test-secret-key-for-hmac-signing";

  beforeEach(() => {
    process.env.REQUEST_TOKEN_SECRET = TEST_SECRET;
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    delete process.env.REQUEST_TOKEN_SECRET;
  });

  it("should generate a token", async () => {
    const { generateToken } = await import("@/lib/request-token");
    const token = await generateToken();
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });

  it("should validate a valid token", async () => {
    const { generateToken, validateToken } = await import("@/lib/request-token");
    const token = await generateToken();
    const result = await validateToken(token);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should reject expired token", async () => {
    const { generateToken, validateToken } = await import("@/lib/request-token");
    const token = await generateToken();

    // Advance time by 6 minutes (tokens expire after 5 minutes)
    vi.advanceTimersByTime(6 * 60 * 1000);

    const result = await validateToken(token);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Token expired");
  });

  it("should reject invalid token format", async () => {
    const { validateToken } = await import("@/lib/request-token");
    const result = await validateToken("invalid-token");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Invalid token format");
  });

  it("should reject tampered token", async () => {
    const { generateToken, validateToken } = await import("@/lib/request-token");
    const token = await generateToken();
    const tampered = token.slice(0, -5) + "xxxxx";
    const result = await validateToken(tampered);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Invalid token signature");
  });
});
