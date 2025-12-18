import { beforeEach, afterEach, expect, vi } from "vitest";

/**
 * Console error guard - fails tests that trigger React warnings
 *
 * Catches:
 * - "Maximum update depth exceeded" (infinite loops)
 * - Missing key warnings
 * - Invalid prop types
 * - Other React errors
 */

let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  // Check if console.error was called
  if (consoleErrorSpy.mock.calls.length > 0) {
    const errors = consoleErrorSpy.mock.calls
      .map((args: unknown[]) => args.map(String).join(" "))
      .join("\n");

    consoleErrorSpy.mockRestore();

    // Fail the test with the error messages
    expect.fail(
      `Test triggered console.error:\n${errors}\n\nThis often indicates React warnings like infinite loops, missing keys, or invalid props.`
    );
  }

  consoleErrorSpy.mockRestore();
});
