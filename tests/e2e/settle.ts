import type { Page } from "@playwright/test";

/**
 * Waits until every CSS animation and transition on the page has finished, so
 * checks such as axe's colour contrast see the page as it rests, not mid-fade.
 */
export async function settle(page: Page): Promise<void> {
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => animation.playState !== "running"),
  );
}
