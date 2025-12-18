import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { server } from "../mocks/server";

describe("useRequestToken", () => {
  const originalFetch = global.fetch;
  const mockFetch = vi.fn();

  // Disable MSW for these tests since we're mocking fetch directly
  beforeAll(() => {
    server.close();
    global.fetch = mockFetch as typeof fetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
    server.listen({ onUnhandledRequest: "error" });
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: "test-token", expiresIn: 300 }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch token on mount", async () => {
    const { useRequestToken } = await import("@/hooks/useRequestToken");
    const { result } = renderHook(() => useRequestToken());

    await waitFor(() => {
      expect(result.current.token).toBe("test-token");
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/token");
  });

  it("should provide getHeaders function", async () => {
    const { useRequestToken } = await import("@/hooks/useRequestToken");
    const { result } = renderHook(() => useRequestToken());

    await waitFor(() => {
      expect(result.current.token).toBe("test-token");
    });

    const headers = result.current.getHeaders();
    expect(headers["X-Request-Token"]).toBe("test-token");
  });

  it("should handle fetch error gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { useRequestToken } = await import("@/hooks/useRequestToken");
    const { result } = renderHook(() => useRequestToken());

    await waitFor(() => {
      expect(result.current.error).toBe("Network error");
    });

    expect(result.current.token).toBeNull();
  });
});
