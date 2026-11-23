import { expect, test } from "@playwright/test";
import { content, LOCALE_INFO, LOCALES, pageTitle, SITE } from "./content";

const PAGES = LOCALES.map((locale) => {
  const other = LOCALES.find((l) => l !== locale)!;
  return {
    path: LOCALE_INFO[locale].path,
    ogLocale: LOCALE_INFO[locale].ogLocale,
    alternate: LOCALE_INFO[other].ogLocale,
    title: pageTitle(content(locale)),
    description: content(locale).profile.bio,
  };
});

for (const { path, ogLocale, alternate, title, description } of PAGES) {
  test(`${path} has its title, description, canonical URL and preview tags`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    const meta = (selector: string) => page.locator(selector).getAttribute("content");
    expect(await meta('meta[name="description"]')).toBe(description);
    expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toBe(`${SITE}${path}`);
    expect(await meta('meta[property="og:url"]')).toBe(`${SITE}${path}`);
    expect(await meta('meta[property="og:title"]')).toBe(title);
    expect(await meta('meta[property="og:locale"]')).toBe(ogLocale);
    expect(await meta('meta[property="og:locale:alternate"]')).toBe(alternate);
    expect(await meta('meta[property="og:image"]')).toMatch(
      new RegExp(`^${SITE}${path}opengraph-image[\\w-]*(\\?|$)`),
    );
    expect(await meta('meta[property="og:image:width"]')).toBe("1200");
    expect(await meta('meta[name="twitter:card"]')).toBe("summary_large_image");
  });

  test(`${path} links every language version with hreflang`, async ({ page }) => {
    await page.goto(path);
    const hreflang = (lang: string) =>
      page.locator(`link[rel="alternate"][hreflang="${lang}"]`).getAttribute("href");
    expect(await hreflang("en")).toBe(`${SITE}/`);
    expect(await hreflang("pt-BR")).toBe(`${SITE}/pt/`);
    expect(await hreflang("x-default")).toBe(`${SITE}/`);
  });

  test(`${path} serves its Open Graph image as a 1200×630 PNG`, async ({ page, request }) => {
    await page.goto(path);
    const url = new URL(
      (await page.locator('meta[property="og:image"]').getAttribute("content")) ?? "",
    );
    const response = await request.get(url.pathname);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/png");
    const body = await response.body();
    expect(body.subarray(1, 4).toString("latin1")).toBe("PNG");
    expect(body.readUInt32BE(16)).toBe(1200);
    expect(body.readUInt32BE(20)).toBe(630);
  });
}

test("the favicon and apple-touch icon are linked and served", async ({ page, request }) => {
  for (const path of ["/", "/pt/"]) {
    await page.goto(path);
    const icon = await page.locator('link[rel="icon"]').getAttribute("href");
    const apple = await page.locator('link[rel="apple-touch-icon"]').getAttribute("href");
    const svg = await request.get(icon!);
    expect(svg.headers()["content-type"]).toBe("image/svg+xml");
    const png = await request.get(apple!);
    expect(png.headers()["content-type"]).toBe("image/png");
    expect((await png.body()).readUInt32BE(16)).toBe(180);
  }
});

test("robots.txt and sitemap.xml point at the production URLs", async ({ request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Allow: /");
  expect(robots).toContain(`Sitemap: ${SITE}/sitemap.xml`);
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain(`<loc>${SITE}/</loc>`);
  expect(sitemap).toContain(`<loc>${SITE}/pt/</loc>`);
  expect(sitemap).toContain(`hreflang="pt-BR" href="${SITE}/pt/"`);
});
