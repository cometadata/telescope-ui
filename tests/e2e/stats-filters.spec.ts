import { test, expect } from "@playwright/test";

test.describe("Stats page filter functionality", () => {
  // Helper to get organization count from header
  const getDisplayedCount = async (page: import("@playwright/test").Page) => {
    const header = page.locator("h2:has-text('Top Organizations')");
    const text = await header.textContent();
    const match = text?.match(/\((\d+(?:,\d+)?)\)/);
    return match ? parseInt(match[1].replace(/,/g, ""), 10) : 0;
  };

  test("year filter should update organization count", async ({ page }) => {
    await page.goto("/stats");
    await page.waitForSelector("text=Top Organizations", { timeout: 15000 });
    await page.waitForSelector('[href^="/organization/"]', { timeout: 15000 });

    const initialCount = await getDisplayedCount(page);

    // Select year filter
    const yearSelect = page.locator("select").filter({ has: page.locator('option:has-text("All Years")') }).first();
    await yearSelect.selectOption({ label: "2020" });

    // Wait for API call to complete
    await page.waitForResponse(
      (response) => response.url().includes("/api/search") && response.url().includes("year"),
      { timeout: 10000 }
    );
    await page.waitForTimeout(500);

    const filteredCount = await getDisplayedCount(page);

    // Count should change when filter is applied
    expect(filteredCount).not.toBe(initialCount);
  });

  test("subject filter should update organization count", async ({ page }) => {
    await page.goto("/stats");
    await page.waitForSelector("text=Top Organizations", { timeout: 15000 });
    await page.waitForSelector('[href^="/organization/"]', { timeout: 15000 });

    const initialCount = await getDisplayedCount(page);

    // Select subject filter
    const subjectSelect = page.locator("select").filter({ has: page.locator('option:has-text("All Subjects")') }).first();
    await subjectSelect.selectOption({ label: "Artificial Intelligence" });

    // Wait for API call to complete
    await page.waitForResponse(
      (response) => response.url().includes("/api/search") && response.url().includes("subject"),
      { timeout: 10000 }
    );
    await page.waitForTimeout(500);

    const filteredCount = await getDisplayedCount(page);

    // Count should change when filter is applied
    expect(filteredCount).not.toBe(initialCount);
  });

  test("filters should stack - country then year", async ({ page }) => {
    await page.goto("/stats");
    await page.waitForSelector("text=Top Organizations", { timeout: 15000 });

    const countrySelect = page.locator("select").filter({ has: page.locator('option:has-text("All Countries")') }).first();
    const yearSelect = page.locator("select").filter({ has: page.locator('option:has-text("All Years")') }).first();

    // Select country first
    await countrySelect.selectOption({ label: "United States" });
    await page.waitForTimeout(1000);
    expect(await countrySelect.inputValue()).toBe("United States");

    // Then select year
    await yearSelect.selectOption({ label: "2023" });
    await page.waitForTimeout(1000);

    // Both filters should remain selected
    expect(await yearSelect.inputValue()).toBe("2023");
    expect(await countrySelect.inputValue()).toBe("United States");
  });

  test("filters should stack - year then country", async ({ page }) => {
    await page.goto("/stats");
    await page.waitForSelector("text=Top Organizations", { timeout: 15000 });

    const countrySelect = page.locator("select").filter({ has: page.locator('option:has-text("All Countries")') }).first();
    const yearSelect = page.locator("select").filter({ has: page.locator('option:has-text("All Years")') }).first();

    // Select year first
    await yearSelect.selectOption({ label: "2020" });
    await page.waitForTimeout(1000);
    expect(await yearSelect.inputValue()).toBe("2020");

    // Then select country
    await countrySelect.selectOption({ label: "China" });
    await page.waitForTimeout(1000);

    // Both filters should remain selected
    expect(await yearSelect.inputValue()).toBe("2020");
    expect(await countrySelect.inputValue()).toBe("China");
  });
});
