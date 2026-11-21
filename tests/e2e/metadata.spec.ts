import { expect, test } from "@playwright/test";

const SITE = "https://links.vinicius-albuquerque.com.br";

test("the page has its title, description, canonical URL and preview tags", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Vinícius Albuquerque · Links");
  const meta = (selector: string) => page.locator(selector).getAttribute("content");
  expect(await meta('meta[name="description"]')).toMatch(/^Engenheiro full-stack/);
  expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toBe(`${SITE}/`);
  expect(await meta('meta[property="og:title"]')).toBe("Vinícius Albuquerque · Links");
  expect(await meta('meta[property="og:locale"]')).toBe("pt_BR");
  expect(await meta('meta[property="og:image"]')).toMatch(
    new RegExp(`^${SITE}/opengraph-image(\\?|$)`),
  );
  expect(await meta('meta[property="og:image:width"]')).toBe("1200");
  expect(await meta('meta[name="twitter:card"]')).toBe("summary_large_image");
});

test("the Open Graph image is served as a 1200×630 PNG", async ({ request }) => {
  const response = await request.get("/opengraph-image");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("image/png");
  const body = await response.body();
  expect(body.subarray(1, 4).toString("latin1")).toBe("PNG");
  expect(body.readUInt32BE(16)).toBe(1200);
  expect(body.readUInt32BE(20)).toBe(630);
});
