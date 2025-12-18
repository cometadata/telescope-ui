import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/search/route";
import { NextRequest } from "next/server";

vi.mock("@/lib/typesense", () => ({
  searchWorks: vi.fn().mockResolvedValue({
    found: 100,
    hits: [],
    facet_counts: [],
  }),
}));

describe("GET /api/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createRequest(params: Record<string, string>): NextRequest {
    const searchParams = new URLSearchParams(params);
    return new NextRequest(
      `http://localhost:3000/api/search?${searchParams.toString()}`
    );
  }

  it("should reject wildcard query q=* without filters", async () => {
    const request = createRequest({ q: "*" });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Please enter a search term or apply filters");
  });

  it("should reject empty query without filters", async () => {
    const request = createRequest({ q: "" });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Please enter a search term or apply filters");
  });

  it("should allow wildcard query q=* with filters", async () => {
    const request = createRequest({ q: "*", filter_by: "year:=2024" });
    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it("should reject query shorter than 2 characters", async () => {
    const request = createRequest({ q: "a" });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Search term must be at least 2 characters");
  });

  it("should accept valid query", async () => {
    const request = createRequest({ q: "machine learning" });
    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it("should cap page at 100", async () => {
    const { searchWorks } = await import("@/lib/typesense");
    const request = createRequest({ q: "test", page: "500" });
    await GET(request);

    expect(searchWorks).toHaveBeenCalledWith(
      expect.objectContaining({ page: 100 })
    );
  });

  it("should cap per_page at 50", async () => {
    const { searchWorks } = await import("@/lib/typesense");
    const request = createRequest({ q: "test", per_page: "100" });
    await GET(request);

    expect(searchWorks).toHaveBeenCalledWith(
      expect.objectContaining({ per_page: 50 })
    );
  });

  it("should allow empty query with filter_by (browsing filtered results)", async () => {
    const request = createRequest({
      q: "",
      filter_by: "year:=2024"
    });
    const response = await GET(request);

    // Browsing filtered results without explicit search term is allowed
    expect(response.status).toBe(200);
  });

  it("should hide total count for deep pagination (page > 10 with > 1000 results)", async () => {
    const { searchWorks } = await import("@/lib/typesense");
    vi.mocked(searchWorks).mockResolvedValueOnce({
      found: 5000,
      hits: [],
      facet_counts: [],
    });

    const request = createRequest({ q: "test", page: "15" });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.found).toBe(-1); // Count hidden for anti-scraping
  });
});
