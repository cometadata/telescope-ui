import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, act } from "../utils/render";
import { FieldedSearchBar } from "@/components/FieldedSearchBar";

// Mock scrollIntoView which doesn't exist in jsdom
Element.prototype.scrollIntoView = vi.fn();

// Router mock state
const mockPush = vi.fn();
const mockReplace = vi.fn();

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
    getAll: vi.fn(() => []),
    has: vi.fn(() => false),
  }),
  usePathname: () => "/",
}));

// Mock useRequestToken hook
vi.mock("@/hooks/useRequestToken", () => ({
  useRequestToken: () => ({
    token: "test-token",
    loading: false,
    error: null,
    getHeaders: () => ({ "X-Request-Token": "test-token" }),
    refreshToken: vi.fn(),
  }),
}));

describe("FieldedSearchBar", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Render Stability", () => {
    it("renders without infinite loops with default props", async () => {
      const renderCountRef = { current: 0 };
      const WrappedComponent = () => {
        // eslint-disable-next-line react-hooks/immutability
        renderCountRef.current++;
        return <FieldedSearchBar />;
      };

      render(<WrappedComponent />);

      // Wait for initial effects to settle
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search works/i)).toBeInTheDocument();
      });

      // Should not exceed reasonable render count
      expect(renderCountRef.current).toBeLessThan(15);
    });

    it("handles initialOrgLabels prop reference changes gracefully", async () => {
      const renderCountRef = { current: 0 };
      const WrappedComponent = ({ orgLabels }: { orgLabels: Record<string, string> }) => {
        // eslint-disable-next-line react-hooks/immutability
        renderCountRef.current++;
        return <FieldedSearchBar initialOrgLabels={orgLabels} />;
      };

      const { rerender } = render(<WrappedComponent orgLabels={{}} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search works/i)).toBeInTheDocument();
      });

      const countAfterMount = renderCountRef.current;

      // Rerender with new object reference (same values)
      rerender(<WrappedComponent orgLabels={{}} />);

      await vi.advanceTimersByTimeAsync(100);

      // Should not cause excessive re-renders (uses EMPTY_ORG_LABELS stable reference)
      expect(renderCountRef.current - countAfterMount).toBeLessThan(5);
    });
  });

  describe("Prop Sync", () => {
    it("syncs textQuery state when initialQuery prop changes", async () => {
      const { rerender } = render(<FieldedSearchBar initialQuery="initial" />);

      const input = screen.getByPlaceholderText(/Search works/i);
      expect(input).toHaveValue("initial");

      rerender(<FieldedSearchBar initialQuery="updated" />);

      await waitFor(() => {
        expect(input).toHaveValue("updated");
      });
    });

    it("syncs selectedFields when initialFilters prop changes", async () => {
      const { rerender } = render(<FieldedSearchBar />);

      // Initially no chips
      expect(screen.queryByText("cs.AI")).not.toBeInTheDocument();

      // Add filter
      rerender(<FieldedSearchBar initialFilters="subject_codes:=`cs.AI`" />);

      await waitFor(() => {
        expect(screen.getByText("Artificial Intelligence")).toBeInTheDocument();
      });
    });

    it("parses org filters with initialOrgLabels", async () => {
      render(
        <FieldedSearchBar
          initialFilters="ror_ids:=`https://ror.org/05x2bcf33`"
          initialOrgLabels={{ "https://ror.org/05x2bcf33": "MIT" }}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("MIT")).toBeInTheDocument();
      });
    });

    it("parses year filters correctly", async () => {
      render(<FieldedSearchBar initialFilters="year:=2024" />);

      await waitFor(() => {
        expect(screen.getByText("2024")).toBeInTheDocument();
      });
    });

    it("parses country filters correctly", async () => {
      render(<FieldedSearchBar initialFilters="countries:=`United States`" />);

      await waitFor(() => {
        expect(screen.getByText("United States")).toBeInTheDocument();
      });
    });

    it("parses multiple filters correctly", async () => {
      render(
        <FieldedSearchBar initialFilters="subject_codes:=`cs.AI` && year:=2024" />
      );

      await waitFor(() => {
        expect(screen.getByText("Artificial Intelligence")).toBeInTheDocument();
        expect(screen.getByText("2024")).toBeInTheDocument();
      });
    });
  });

  describe("Field Prefix Detection", () => {
    it("detects org: prefix and shows suggestions", async () => {
      render(<FieldedSearchBar />);

      const input = screen.getByPlaceholderText(/Search works/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: "org:" } });
        await vi.advanceTimersByTimeAsync(100);
      });

      await waitFor(() => {
        // Input placeholder should change to org mode
        expect(screen.getByPlaceholderText(/Organization name/i)).toBeInTheDocument();
      });
    });

    it("detects subject: prefix and shows suggestions", async () => {
      render(<FieldedSearchBar />);

      const input = screen.getByPlaceholderText(/Search works/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: "subject:" } });
        await vi.advanceTimersByTimeAsync(100);
      });

      await waitFor(() => {
        // Check placeholder changed to subject mode
        expect(screen.getByPlaceholderText(/Subject area/i)).toBeInTheDocument();
      });
    });

    it("detects year: prefix and shows suggestions", async () => {
      render(<FieldedSearchBar />);

      const input = screen.getByPlaceholderText(/Search works/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: "year:" } });
        await vi.advanceTimersByTimeAsync(100);
      });

      await waitFor(() => {
        // Check placeholder changed to year mode
        expect(screen.getByPlaceholderText(/Year/i)).toBeInTheDocument();
      });
    });

    it("detects country: prefix and shows suggestions", async () => {
      render(<FieldedSearchBar />);

      const input = screen.getByPlaceholderText(/Search works/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: "country:" } });
        await vi.advanceTimersByTimeAsync(100);
      });

      await waitFor(() => {
        // Check placeholder changed to country mode
        expect(screen.getByPlaceholderText(/Country name/i)).toBeInTheDocument();
      });
    });
  });

  describe("Keyboard Navigation", () => {
    it("navigates suggestions with Arrow keys", async () => {
      render(<FieldedSearchBar />);

      const input = screen.getByPlaceholderText(/Search works/i);

      // Activate subject field mode
      await act(async () => {
        fireEvent.change(input, { target: { value: "subject:" } });
        await vi.advanceTimersByTimeAsync(100);
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Subject area/i)).toBeInTheDocument();
      });

      // Subjects should be showing
      await waitFor(() => {
        expect(screen.getByText("Artificial Intelligence")).toBeInTheDocument();
      });

      // Get the input again after mode change
      const subjectInput = screen.getByPlaceholderText(/Subject area/i);

      // Arrow down should highlight first suggestion
      await act(async () => {
        fireEvent.keyDown(subjectInput, { key: "ArrowDown" });
        await vi.advanceTimersByTimeAsync(50);
      });

      // Check that suggestions exist with data-suggestion attribute
      const suggestions = screen.getAllByRole("button").filter(
        (btn) => btn.getAttribute("data-suggestion") !== null
      );
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it("selects suggestion with Enter key", async () => {
      render(<FieldedSearchBar />);

      const input = screen.getByPlaceholderText(/Search works/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: "subject:" } });
        await vi.advanceTimersByTimeAsync(100);
      });

      await waitFor(() => {
        expect(screen.getByText("Artificial Intelligence")).toBeInTheDocument();
      });

      const subjectInput = screen.getByPlaceholderText(/Subject area/i);

      // Press Enter to select first suggestion
      await act(async () => {
        fireEvent.keyDown(subjectInput, { key: "Enter" });
        await vi.advanceTimersByTimeAsync(100);
      });

      // Should add chip with the subject name (in chip format)
      await waitFor(() => {
        const chips = screen.getAllByText("Artificial Intelligence");
        expect(chips.some((el) => el.closest("span.inline-flex"))).toBe(true);
      });
    });

    it("cancels field input with Escape key", async () => {
      render(<FieldedSearchBar />);

      const input = screen.getByPlaceholderText(/Search works/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: "subject:" } });
        await vi.advanceTimersByTimeAsync(100);
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Subject area/i)).toBeInTheDocument();
      });

      const subjectInput = screen.getByPlaceholderText(/Subject area/i);

      await act(async () => {
        fireEvent.keyDown(subjectInput, { key: "Escape" });
        await vi.advanceTimersByTimeAsync(100);
      });

      // Should go back to normal search mode
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search works/i)).toBeInTheDocument();
      });
    });

    it("removes last chip with Backspace when input is empty", async () => {
      render(<FieldedSearchBar initialFilters="year:=2024" />);

      await waitFor(() => {
        expect(screen.getByText("2024")).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/Add more filters/i);

      // Backspace should remove the chip
      fireEvent.keyDown(input, { key: "Backspace" });

      await waitFor(() => {
        expect(screen.queryByText("2024")).not.toBeInTheDocument();
      });
    });
  });

  describe("Suggestion Selection", () => {
    it("adds chip when suggestion is selected", async () => {
      render(<FieldedSearchBar />);

      const input = screen.getByPlaceholderText(/Search works/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: "subject:" } });
        await vi.advanceTimersByTimeAsync(100);
      });

      await waitFor(() => {
        expect(screen.getByText("Artificial Intelligence")).toBeInTheDocument();
      });

      // Click on suggestion
      await act(async () => {
        fireEvent.click(screen.getByText("Artificial Intelligence"));
        await vi.advanceTimersByTimeAsync(100);
      });

      await waitFor(() => {
        // Chip should be added - look for the chip with inline-flex class
        const chips = screen.getAllByText("Artificial Intelligence");
        expect(chips.some((el) => el.closest("span.inline-flex"))).toBe(true);
      });
    });

    it("clears input after selecting suggestion", async () => {
      render(<FieldedSearchBar />);

      const input = screen.getByPlaceholderText(/Search works/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: "subject:" } });
        await vi.advanceTimersByTimeAsync(100);
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Subject area/i)).toBeInTheDocument();
      });

      // Type to filter
      const subjectInput = screen.getByPlaceholderText(/Subject area/i);
      await act(async () => {
        fireEvent.change(subjectInput, { target: { value: "art" } });
        await vi.advanceTimersByTimeAsync(100);
      });

      await waitFor(() => {
        expect(screen.getByText("Artificial Intelligence")).toBeInTheDocument();
      });

      // Select
      await act(async () => {
        fireEvent.click(screen.getByText("Artificial Intelligence"));
        await vi.advanceTimersByTimeAsync(100);
      });

      await waitFor(() => {
        // Input should be empty after selection
        const currentInput = screen.getByPlaceholderText(/Add more filters/i);
        expect(currentInput).toHaveValue("");
      });
    });
  });

  describe("Chip Removal", () => {
    it("removes chip when X button is clicked", async () => {
      render(<FieldedSearchBar initialFilters="year:=2024" />);

      await waitFor(() => {
        expect(screen.getByText("2024")).toBeInTheDocument();
      });

      const removeButton = screen.getByLabelText("Remove 2024");
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByText("2024")).not.toBeInTheDocument();
      });
    });

    it("updates state correctly after removing chip", async () => {
      render(<FieldedSearchBar initialFilters="year:=2024 && subject_codes:=`cs.AI`" />);

      await waitFor(() => {
        expect(screen.getByText("2024")).toBeInTheDocument();
        expect(screen.getByText("Artificial Intelligence")).toBeInTheDocument();
      });

      const removeButton = screen.getByLabelText("Remove 2024");
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByText("2024")).not.toBeInTheDocument();
        expect(screen.getByText("Artificial Intelligence")).toBeInTheDocument();
      });
    });
  });

  describe("Form Submission", () => {
    it("builds correct URL with query only", async () => {
      render(<FieldedSearchBar />);

      const input = screen.getByPlaceholderText(/Search works/i);
      fireEvent.change(input, { target: { value: "machine learning" } });

      const form = input.closest("form")!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/search?q=machine+learning");
      });
    });

    it("builds correct URL with single filter", async () => {
      render(<FieldedSearchBar initialFilters="year:=2024" />);

      await waitFor(() => {
        expect(screen.getByText("2024")).toBeInTheDocument();
      });

      const form = screen.getByRole("textbox").closest("form")!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining("filter_by=year")
        );
      });
    });

    it("builds correct URL with query and filters", async () => {
      render(<FieldedSearchBar initialQuery="test" initialFilters="year:=2024" />);

      await waitFor(() => {
        expect(screen.getByText("2024")).toBeInTheDocument();
      });

      const form = screen.getByRole("textbox").closest("form")!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringMatching(/q=test.*filter_by/)
        );
      });
    });

    it("uses AND logic for multiple org filters", async () => {
      render(
        <FieldedSearchBar
          initialFilters="ror_ids:=`https://ror.org/05x2bcf33` && ror_ids:=`https://ror.org/03vek6s52`"
          initialOrgLabels={{
            "https://ror.org/05x2bcf33": "MIT",
            "https://ror.org/03vek6s52": "Harvard",
          }}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("MIT")).toBeInTheDocument();
        expect(screen.getByText("Harvard")).toBeInTheDocument();
      });

      const form = screen.getByRole("textbox").closest("form")!;
      fireEvent.submit(form);

      await waitFor(() => {
        const call = mockPush.mock.calls[0][0];
        // Each org should be a separate clause (AND logic)
        expect(call).toContain("ror_ids");
      });
    });

    it("navigates to /search without params when empty", async () => {
      render(<FieldedSearchBar />);

      const form = screen.getByRole("textbox").closest("form")!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/search");
      });
    });
  });

  describe("Autocomplete", () => {
    it("calls autocomplete API with debounce for institutions", async () => {
      const fetchSpy = vi.spyOn(global, "fetch");

      render(<FieldedSearchBar />);

      const input = screen.getByPlaceholderText(/Search works/i);

      // Activate org mode
      await act(async () => {
        fireEvent.change(input, { target: { value: "org:" } });
        await vi.advanceTimersByTimeAsync(100);
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Organization name/i)).toBeInTheDocument();
      });

      // Type query
      const orgInput = screen.getByPlaceholderText(/Organization name/i);
      await act(async () => {
        fireEvent.change(orgInput, { target: { value: "MIT" } });
        // Advance timers for debounce
        await vi.advanceTimersByTimeAsync(500);
      });

      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledWith(
          expect.stringContaining("/api/autocomplete?q=MIT"),
          expect.any(Object)
        );
      });

      fetchSpy.mockRestore();
    });

    it("filters subjects locally without API call", async () => {
      render(<FieldedSearchBar />);

      const fetchSpy = vi.spyOn(global, "fetch");

      const input = screen.getByPlaceholderText(/Search works/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: "subject:" } });
        await vi.advanceTimersByTimeAsync(100);
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Subject area/i)).toBeInTheDocument();
      });

      // Count calls before filtering
      const callsBeforeFilter = fetchSpy.mock.calls.filter(
        (call) => typeof call[0] === "string" && call[0].includes("/api/autocomplete")
      ).length;

      // Type to filter subjects
      const subjectInput = screen.getByPlaceholderText(/Subject area/i);
      await act(async () => {
        fireEvent.change(subjectInput, { target: { value: "art" } });
        await vi.advanceTimersByTimeAsync(300);
      });

      await waitFor(() => {
        expect(screen.getByText("Artificial Intelligence")).toBeInTheDocument();
      });

      // Should not make additional API calls for subject filtering (it's local)
      const callsAfterFilter = fetchSpy.mock.calls.filter(
        (call) => typeof call[0] === "string" && call[0].includes("/api/autocomplete")
      ).length;

      expect(callsAfterFilter).toBe(callsBeforeFilter);

      fetchSpy.mockRestore();
    });
  });

  describe("Filter Hint Buttons", () => {
    it("clicking org: button activates org field mode", async () => {
      render(<FieldedSearchBar />);

      // Get all buttons with "org:" text and find the hint button (not the field indicator)
      const allOrgButtons = screen.getAllByRole("button").filter(
        (btn) => btn.textContent === "org:"
      );
      const orgHintButton = allOrgButtons.find((btn) =>
        btn.classList.contains("bg-gray-100")
      );
      expect(orgHintButton).toBeDefined();

      await act(async () => {
        fireEvent.click(orgHintButton!);
        await vi.advanceTimersByTimeAsync(100);
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Organization name/i)).toBeInTheDocument();
      });
    });

    it("clicking subject: button activates subject field mode", async () => {
      render(<FieldedSearchBar />);

      const allSubjectButtons = screen.getAllByRole("button").filter(
        (btn) => btn.textContent === "subject:"
      );
      const subjectHintButton = allSubjectButtons.find((btn) =>
        btn.classList.contains("bg-gray-100")
      );
      expect(subjectHintButton).toBeDefined();

      await act(async () => {
        fireEvent.click(subjectHintButton!);
        await vi.advanceTimersByTimeAsync(100);
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Subject area/i)).toBeInTheDocument();
      });
    });
  });
});
