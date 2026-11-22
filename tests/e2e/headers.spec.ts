import { expect, test } from "@playwright/test";

// The preview server applies vercel.json, so these are production's headers.

test("the page is served with the security headers", async ({ request }) => {
  const headers = (await request.get("/")).headers();
  const csp = headers["content-security-policy"] ?? "";
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain("base-uri 'self'");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["permissions-policy"]).toContain("camera=()");
  expect(headers["strict-transport-security"]).toMatch(/^max-age=\d+/);
});

test("nothing on the page breaks under the CSP", async ({ page }) => {
  const problems: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(message.text());
  });
  page.on("pageerror", (error) => problems.push(error.message));
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Share this page" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  expect(problems).toEqual([]);
});
