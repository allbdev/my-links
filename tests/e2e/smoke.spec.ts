import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { cards, content, headers, LOCALE_INFO, LOCALES, startsWith, t } from "./content";
import { settle } from "./settle";

const en = content("en");

const PAGES = LOCALES.map((locale) => ({
  locale,
  path: LOCALE_INFO[locale].path,
  lang: LOCALE_INFO[locale].htmlLang,
}));

for (const { locale, path, lang } of PAGES) {
  test.describe(`${path} (${lang})`, () => {
    test.beforeEach(async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
    });

    test("loads in its language with the profile", async ({ page }) => {
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      const { profile } = content(locale);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.name);
      if (profile.avatar) {
        const photo = t(locale, "profile.photo", { name: profile.name });
        await expect(page.getByRole("img", { name: photo })).toBeVisible();
      }
      for (const header of headers(locale)) {
        await expect(page.getByRole("heading", { level: 2, name: header.title })).toBeVisible();
      }
    });

    test("every link has a safe href, and external ones open safely in a new tab", async ({
      page,
    }) => {
      const links = await page.locator("a").evaluateAll((anchors) =>
        anchors.map((a) => ({
          href: a.getAttribute("href") ?? "",
          target: a.getAttribute("target"),
          rel: a.getAttribute("rel") ?? "",
        })),
      );
      const { socials } = content(locale);
      expect(links.length).toBeGreaterThanOrEqual(cards(locale).length + socials.length);
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

    test("axe finds no accessibility violations", async ({ page }) => {
      await settle(page);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  });
}

test("headings are one h1 and an h2 per section", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h2")).toHaveCount(headers("en").length);
  for (const header of headers("en")) {
    await expect(page.getByRole("region", { name: header.title })).toBeVisible();
  }
});

test("the language switch moves between the English and Portuguese pages", async ({ page }) => {
  await page.goto("/");
  const languages = page.getByRole("navigation", { name: "Language" });
  await expect(languages.getByRole("link", { name: "EN (English)" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await languages.getByRole("link", { name: "PT (Português)" }).click();
  await expect(page).toHaveURL(/\/pt\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await expect(page.getByText(content("pt").profile.bio, { exact: true })).toBeVisible();

  const idioma = page.getByRole("navigation", { name: "Idioma" });
  await expect(idioma.getByRole("link", { name: "PT (Português)" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await idioma.getByRole("link", { name: "EN (English)" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByText(en.profile.bio, { exact: true })).toBeVisible();
});

test("every card links to its URL in each language, in the file's order", async ({ page }) => {
  for (const { locale, path } of PAGES) {
    await page.goto(path);
    const hrefs = await page
      .locator("main section:not([aria-labelledby='profile-name']) a[href]")
      .evaluateAll((anchors) => anchors.map((a) => a.getAttribute("href")));
    expect(hrefs, path).toEqual(cards(locale).map((card) => card.url));
  }
});

test("keyboard focus is visible and follows the page order", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus");
  await expect(focused).toHaveAccessibleName("EN (English)");
  const outline = await focused.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outline).not.toBe("none");
  await page.keyboard.press("Tab");
  await expect(focused).toHaveAccessibleName("PT (Português)");
  await page.keyboard.press("Tab");
  await expect(focused).toHaveAttribute("aria-label", t("en", "share.page"));
  await page.keyboard.press("Tab");
  const firstSocial = en.socials[0];
  if (firstSocial) {
    const label = t("en", `social.${firstSocial.type}`);
    await expect(focused).toHaveAttribute("aria-label", startsWith(label));
  } else {
    await expect(focused).toHaveAccessibleName(startsWith(cards("en")[0]!.title));
  }
});

test("unknown paths get the 404 page in both languages", async ({ page }) => {
  const response = await page.goto("/nope/");
  expect(response?.status()).toBe(404);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to the links" })).toHaveAttribute("href", "/");
  await expect(page.getByRole("link", { name: "Voltar para os links" })).toHaveAttribute(
    "href",
    "/pt/",
  );
  await settle(page);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("nothing loads from other origins", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (request) => {
    if (!request.url().startsWith("http://127.0.0.1")) external.push(request.url());
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.goto("/pt/");
  await page.waitForLoadState("networkidle");
  expect(external).toEqual([]);
});

test("on load, what's on screen rises in and rests fully visible", async ({ page }) => {
  await page.goto("/");
  const heading = page.getByRole("heading", { level: 1 });
  expect(await heading.evaluate((el) => getComputedStyle(el).animationName)).toBe("enter");
  await settle(page);
  const onScreen = await page
    .locator(".enter:not([data-reveal])")
    .evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity));
  expect(onScreen.length).toBeGreaterThan(3);
  expect(new Set(onScreen)).toEqual(new Set(["1"]));
});

test("cards below the fold wait, then rise in as they scroll into view", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 640 });
  await page.goto("/");
  await settle(page);
  const last = cards("en").at(-1)!;
  const contact = page.locator(".enter", { hasText: last.title }).last();
  const box = await contact.boundingBox();
  test.skip(!box || box.y < 640, "the page is too short to have cards below the fold");
  await expect(contact).toHaveAttribute("data-reveal", "waiting");
  expect(await contact.evaluate((el) => getComputedStyle(el).opacity)).toBe("0");

  await contact.scrollIntoViewIfNeeded();
  await expect(contact).toHaveAttribute("data-reveal", "shown");
  await settle(page);
  expect(await contact.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
});

test("without JavaScript everything still appears", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  // settle() needs page scripts, so poll from here until the entrance is over.
  const enter = page.locator(".enter");
  expect(await enter.count()).toBeGreaterThanOrEqual(cards("en").length);
  await expect
    .poll(
      async () =>
        new Set(await enter.evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity))),
    )
    .toEqual(new Set(["1"]));
  await context.close();
});

test("with reduced motion the page only fades in, and cards don't move", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const heading = page.getByRole("heading", { level: 1 });
  expect(await heading.evaluate((el) => getComputedStyle(el).animationName)).toBe("fade-in");
  await settle(page);
  expect(await page.locator("[data-reveal]").count()).toBe(0);
  const firstLink = cards("en").find((card) => card.type === "link")!;
  const card = page.getByRole("link", { name: startsWith(firstLink.title) }).first();
  await card.hover();
  const transform = await card.evaluate((el) => getComputedStyle(el.closest("div")!).transform);
  expect(transform).toBe("none");
});

test("the social row links to every social in links.json, in order", async ({ page }) => {
  for (const { locale, path } of PAGES) {
    const { socials } = content(locale);
    test.skip(socials.length === 0, "no socials in links.json");
    await page.goto(path);
    const links = page.getByRole("list", { name: t(locale, "profile.socials") }).getByRole("link");
    await expect(links).toHaveCount(socials.length);
    for (const [i, social] of socials.entries()) {
      const link = links.nth(i);
      await expect(link).toHaveAttribute("href", social.url);
      await expect(link).toHaveAccessibleName(startsWith(t(locale, `social.${social.type}`)));
      if (social.url.startsWith("https://")) await expect(link).toHaveAttribute("target", "_blank");
    }
  }
});

test("link thumbnails are served from this site", async ({ page, request }) => {
  await page.goto("/");
  const withImage = cards("en").filter((card) => card.type === "link" && card.image);
  test.skip(withImage.length === 0, "no link has an image in links.json");
  for (const card of withImage) {
    const link = page.getByRole("link", { name: startsWith(card.title) }).first();
    const img = link.locator("img");
    await expect(img).toHaveAttribute("src", card.image!);
    await expect(img).toHaveAttribute("alt", "");
    const response = await request.get(card.image!);
    expect(response.status(), card.image).toBe(200);
  }
});
