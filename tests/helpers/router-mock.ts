import { vi } from "vitest";

/**
 * Mock factory for Next.js App Router navigation hooks
 *
 * Usage:
 * ```ts
 * vi.mock("next/navigation", () => createRouterMock());
 *
 * // Access mocks in tests:
 * const { push, replace } = getRouterMock();
 * expect(push).toHaveBeenCalledWith("/search?q=test");
 * ```
 */

export interface RouterMock {
  push: ReturnType<typeof vi.fn>;
  replace: ReturnType<typeof vi.fn>;
  refresh: ReturnType<typeof vi.fn>;
  back: ReturnType<typeof vi.fn>;
  forward: ReturnType<typeof vi.fn>;
  prefetch: ReturnType<typeof vi.fn>;
}

export interface SearchParamsMock {
  get: ReturnType<typeof vi.fn>;
  getAll: ReturnType<typeof vi.fn>;
  has: ReturnType<typeof vi.fn>;
  entries: ReturnType<typeof vi.fn>;
  keys: ReturnType<typeof vi.fn>;
  values: ReturnType<typeof vi.fn>;
  toString: ReturnType<typeof vi.fn>;
  forEach: ReturnType<typeof vi.fn>;
}

let currentRouter: RouterMock | null = null;
let currentSearchParams: SearchParamsMock | null = null;
let searchParamsData: Record<string, string | string[]> = {};

/**
 * Creates fresh router mock with all navigation methods
 */
export function createRouterMock(initialSearchParams: Record<string, string | string[]> = {}) {
  searchParamsData = initialSearchParams;

  currentRouter = {
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  };

  currentSearchParams = {
    get: vi.fn((key: string) => {
      const value = searchParamsData[key];
      if (Array.isArray(value)) return value[0] ?? null;
      return value ?? null;
    }),
    getAll: vi.fn((key: string) => {
      const value = searchParamsData[key];
      if (Array.isArray(value)) return value;
      return value ? [value] : [];
    }),
    has: vi.fn((key: string) => key in searchParamsData),
    entries: vi.fn(() => Object.entries(searchParamsData).flatMap(([k, v]) =>
      Array.isArray(v) ? v.map((val) => [k, val]) : [[k, v]]
    )),
    keys: vi.fn(() => Object.keys(searchParamsData)),
    values: vi.fn(() => Object.values(searchParamsData).flat()),
    toString: vi.fn(() => {
      const params = new URLSearchParams();
      Object.entries(searchParamsData).forEach(([k, v]) => {
        if (Array.isArray(v)) {
          v.forEach((val) => params.append(k, val));
        } else {
          params.set(k, v);
        }
      });
      return params.toString();
    }),
    forEach: vi.fn((callback: (value: string, key: string) => void) => {
      Object.entries(searchParamsData).forEach(([k, v]) => {
        if (Array.isArray(v)) {
          v.forEach((val) => callback(val, k));
        } else {
          callback(v, k);
        }
      });
    }),
  };

  return {
    useRouter: () => currentRouter,
    useSearchParams: () => currentSearchParams,
    usePathname: () => "/",
    useParams: () => ({}),
    notFound: vi.fn(),
    redirect: vi.fn(),
  };
}

/**
 * Get current router mock instance for assertions
 */
export function getRouterMock(): RouterMock {
  if (!currentRouter) {
    throw new Error("Router mock not initialized. Call createRouterMock() first.");
  }
  return currentRouter;
}

/**
 * Get current search params mock instance
 */
export function getSearchParamsMock(): SearchParamsMock {
  if (!currentSearchParams) {
    throw new Error("SearchParams mock not initialized. Call createRouterMock() first.");
  }
  return currentSearchParams;
}

/**
 * Update search params data for testing param changes
 */
export function setSearchParams(params: Record<string, string | string[]>) {
  searchParamsData = params;
}

/**
 * Reset all router mocks between tests
 */
export function resetRouterMocks() {
  currentRouter?.push.mockClear();
  currentRouter?.replace.mockClear();
  currentRouter?.refresh.mockClear();
  currentRouter?.back.mockClear();
  currentRouter?.forward.mockClear();
  currentRouter?.prefetch.mockClear();
  searchParamsData = {};
}
