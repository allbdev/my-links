import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { absoluteUrl, cards, shareable, SITE, startsWith, t } from "./content";
import { settle } from "./settle";
import { displayUrl } from "@/lib/url";

const firstShared = shareable("en")[0]!;
const firstHttps = shareable("en").find((card) => card.url.startsWith("https://")) ?? firstShared;
const emailCard = cards("en").find((card) => card.url.startsWith("mailto:"));

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("shares the page from the top bar", async ({ page }) => {
  await page.getByRole("button", { name: "Share this page" }).click();
  const dialog = page.getByRole("dialog", { name: "Share page" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(displayUrl(SITE), { exact: true })).toBeVisible();
  await expect(dialog.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
    "href",
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${SITE}/`)}`,
  );
  await expect(dialog.getByRole("button", { name: "Copy link" })).toBeFocused();
});

test("shares one link from its ⋮ button, and Esc returns focus", async ({ page }) => {
  const opener = page.getByRole("button", {
    name: t("en", "share.link", { title: firstShared.title }),
  });
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "Share link" });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByText(displayUrl(absoluteUrl(firstShared.url, SITE)), { exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test("e-mail links have no share button", async ({ page }) => {
  test.skip(!emailCard, "no e-mail link in links.json");
  await expect(page.getByRole("link", { name: startsWith(emailCard!.title) })).toBeVisible();
  await expect(
    page.getByRole("button", { name: t("en", "share.link", { title: emailCard!.title }) }),
  ).toHaveCount(0);
});

test("the backdrop closes the dialog", async ({ page }) => {
  await page.getByRole("button", { name: "Share this page" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(dialog).toBeHidden();
});

test("copies the link to the clipboard", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium", "clipboard permissions are Chromium-only here");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page
    .getByRole("button", { name: t("en", "share.link", { title: firstHttps.title }) })
    .first()
    .click();
  await page.getByRole("button", { name: "Copy link" }).click();
  await expect(page.getByRole("button", { name: "Copied!" })).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe(absoluteUrl(firstHttps.url, SITE));
});

test("the open dialog passes axe and keeps focus inside", async ({ page }) => {
  await page.getByRole("button", { name: "Share this page" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await settle(page);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press("Tab");
    const inside = await page.evaluate(
      () =>
        document.activeElement?.closest("dialog") !== null ||
        document.activeElement === document.body,
    );
    expect(inside).toBe(true);
  }
});

test("the Portuguese page shares itself, in Portuguese", async ({ page }) => {
  await page.goto("/pt/");
  await page.getByRole("button", { name: "Compartilhar esta página" }).click();
  const dialog = page.getByRole("dialog", { name: "Compartilhar página" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(displayUrl(`${SITE}/pt/`), { exact: true })).toBeVisible();
  await expect(dialog.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
    "href",
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${SITE}/pt/`)}`,
  );
  await expect(dialog.getByRole("button", { name: "Copiar link" })).toBeFocused();
  await settle(page);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
