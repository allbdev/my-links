// Captures each design board from the built site (npm run designs).
// Needs `npm run build && npm run preview` running. Usage:
//   npm run designs -- --out=design-captures --base=http://127.0.0.1:4180
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import { BOARD_HEIGHT, BOARD_WIDTH, BOARDS } from "./boards";

/** Time after load at which the featured animation shows the logo and greeting. */
const FEATURED_SETTLE_MS = 2000;

function arg(name: string, fallback: string): string {
  const prefix = `--${name}=`;
  return process.argv.find((a) => a.startsWith(prefix))?.slice(prefix.length) ?? fallback;
}

async function main(): Promise<void> {
  const out = arg("out", "design-captures");
  const base = arg("base", "http://127.0.0.1:4180");
  mkdirSync(out, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: BOARD_WIDTH, height: BOARD_HEIGHT },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });
  for (const board of BOARDS) {
    const page = await context.newPage();
    await page.goto(base);
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    // The featured image is an animation that opens on a near-black frame; wait
    // until it shows the logo and greeting so the board isn't a dark box.
    await page.waitForTimeout(FEATURED_SETTLE_MS);
    if (board.openShare) {
      await page.getByRole("button", { name: board.openShare }).click();
      await page.getByRole("dialog").waitFor();
      await page.mouse.move(0, 0);
    }
    const path = join(out, board.file);
    await page.screenshot({ path, type: "jpeg", quality: 85, fullPage: board.fullPage });
    console.log(`${board.title} → ${path}`);
    await page.close();
  }
  await browser.close();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
