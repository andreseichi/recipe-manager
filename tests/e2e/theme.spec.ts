import { expect, test, type Page } from "@playwright/test";

async function createTestUser(page: Page, prefix: string) {
  const email = `${prefix}-${crypto.randomUUID()}@example.com`;
  const response = await page.request.post("/api/auth/sign-up/email", {
    data: {
      name: `Usuario ${prefix}`,
      email,
      password: "test-password-123",
    },
  });

  expect(response.ok(), await response.text()).toBe(true);
}

async function expectDarkMode(page: Page, enabled: boolean) {
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.classList.contains("dark")),
    )
    .toBe(enabled);
}

function captureHydrationErrors(page: Page) {
  const messages: string[] = [];
  const hydrationPatterns = [
    "Hydration failed",
    "server rendered HTML didn't match the client",
  ];

  page.on("console", (message) => {
    const text = message.text();

    if (
      message.type() === "error" &&
      hydrationPatterns.some((pattern) => text.includes(pattern))
    ) {
      messages.push(text);
    }
  });

  page.on("pageerror", (error) => {
    const text = error.message;

    if (hydrationPatterns.some((pattern) => text.includes(pattern))) {
      messages.push(text);
    }
  });

  return messages;
}

test("theme toggle persists and works across public and authenticated pages", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("theme", "light"));
  await page.reload();

  const landingThemeToggle = page.getByRole("button", {
    name: "Alternar tema",
  });

  await expect(landingThemeToggle).toBeVisible();
  await expectDarkMode(page, false);

  await landingThemeToggle.click();
  await expectDarkMode(page, true);
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("theme")))
    .toBe("dark");

  await page.reload();
  await expectDarkMode(page, true);

  await createTestUser(page, "theme-toggle");
  await page.goto("/recipes");

  const appThemeToggle = page.getByRole("button", {
    name: "Alternar tema",
  });

  await expect(appThemeToggle).toBeVisible();
  await expectDarkMode(page, true);

  await appThemeToggle.click();
  await expectDarkMode(page, false);
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("theme")))
    .toBe("light");
});

test("system dark theme hydrates authenticated toggle without mismatch", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() => localStorage.removeItem("theme"));

  const hydrationErrors = captureHydrationErrors(page);

  await createTestUser(page, "theme-system");
  await page.goto("/recipes");

  const appThemeToggle = page.getByRole("button", {
    name: "Alternar tema",
  });

  await expect(appThemeToggle).toBeVisible();
  await expect(appThemeToggle).toHaveAttribute("aria-pressed", "true");
  await expectDarkMode(page, true);
  expect(hydrationErrors).toEqual([]);

  await appThemeToggle.click();
  await expectDarkMode(page, false);
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("theme")))
    .toBe("light");
  expect(hydrationErrors).toEqual([]);
});
