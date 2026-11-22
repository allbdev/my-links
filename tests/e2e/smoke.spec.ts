import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { settle } from "./settle";

const PAGES = [
  { path: "/", lang: "en", photo: "Photo of Vinícius Albuquerque", section: "Projects" },
  { path: "/pt/", lang: "pt-BR", photo: "Foto de Vinícius Albuquerque", section: "Projetos" },
] as const;

for (const { path, lang, photo, section } of PAGES) {
  test.describe(`${path} (${lang})`, () => {
    test.beforeEach(async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
    });

    test("loads in its language with the profile", async ({ page }) => {
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Vinícius Albuquerque");
      await expect(page.getByRole("img", { name: photo })).toBeVisible();
      await expect(page.getByRole("heading", { level: 2, name: section })).toBeVisible();
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
  await expect(page.getByRole("heading", { level: 2, name: "Projects" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Contact" })).toBeVisible();
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
  await expect(page.getByText(/^Engenheiro full-stack/)).toBeVisible();

  const idioma = page.getByRole("navigation", { name: "Idioma" });
  await expect(idioma.getByRole("link", { name: "PT (Português)" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await idioma.getByRole("link", { name: "EN (English)" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByText(/^Senior full-stack engineer/)).toBeVisible();
});

test("links point at each language's version of the portfolio", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /^Portfolio/ })).toHaveAttribute(
    "href",
    "https://www.vinicius-albuquerque.com.br/en",
  );
  await page.goto("/pt/");
  await expect(page.getByRole("link", { name: /^Portfólio/ })).toHaveAttribute(
    "href",
    "https://www.vinicius-albuquerque.com.br/pt",
  );
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
  await expect(focused).toHaveAttribute("aria-label", "Share this page");
  await page.keyboard.press("Tab");
  await expect(focused).toHaveAttribute("aria-label", /^GitHub/);
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
  const contact = page.locator(".enter", { hasText: "Send an email" });
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
  expect(await enter.count()).toBeGreaterThan(8);
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
  const card = page.getByRole("link", { name: /^Portfolio/ });
  await card.hover();
  const transform = await card.evaluate((el) => getComputedStyle(el.closest("div")!).transform);
  expect(transform).toBe("none");
});
