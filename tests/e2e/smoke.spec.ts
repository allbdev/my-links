import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
});

test("the page loads in Portuguese with the profile", async ({ page }) => {
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Vinícius Albuquerque");
  await expect(page.getByRole("img", { name: "Foto de Vinícius Albuquerque" })).toBeVisible();
});

test("every link has a safe href, and external ones open safely in a new tab", async ({ page }) => {
  const links = await page.locator("a").evaluateAll((anchors) =>
    anchors.map((a) => ({
      href: a.getAttribute("href") ?? "",
      target: a.getAttribute("target"),
      rel: a.getAttribute("rel") ?? "",
    })),
  );
  expect(links.length).toBeGreaterThan(5);
  for (const link of links) {
    expect(link.href).toMatch(/^(https:\/\/|mailto:|\/)/);
    if (link.href.startsWith("https://")) {
      expect(link.target).toBe("_blank");
      expect(link.rel).toContain("noopener");
      expect(link.rel).toContain("noreferrer");
    } else {
      expect(link.target).toBeNull();
    }
  }
});

test("headings are one h1 and an h2 per section", async ({ page }) => {
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 2, name: "Projetos" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Contato" })).toBeVisible();
});

test("touch targets are at least 44 px", async ({ page }) => {
  const sizes = await page
    .locator("main a, main button")
    .evaluateAll((els) => els.map((el) => el.getBoundingClientRect()))
    .then((rects) => rects.map((r) => ({ w: r.width, h: r.height })));
  for (const size of sizes) {
    expect(size.w).toBeGreaterThanOrEqual(44);
    expect(size.h).toBeGreaterThanOrEqual(44);
  }
});

test("keyboard focus is visible and follows the page order", async ({ page }) => {
  await page.keyboard.press("Tab");
  const first = page.locator(":focus");
  await expect(first).toHaveAttribute("aria-label", /GitHub/);
  const outline = await first.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outline).not.toBe("none");
});

test("axe finds no accessibility violations", async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("nothing loads from other origins", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (request) => {
    if (!request.url().startsWith("http://127.0.0.1")) external.push(request.url());
  });
  await page.reload();
  await page.waitForLoadState("networkidle");
  expect(external).toEqual([]);
});
