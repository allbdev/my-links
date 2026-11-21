// Gzipped size of the JS and CSS that out/index.html loads (npm run size).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

export const JS_BUDGET_KB = 150;
export const CSS_BUDGET_KB = 20;

/**
 * Asset URLs an HTML page loads in a modern browser: scripts (minus `noModule`
 * polyfills, which modern browsers skip) and stylesheets.
 */
export function assetsOf(html: string): { js: string[]; css: string[] } {
  const js = new Set<string>();
  const css = new Set<string>();
  for (const m of html.matchAll(/<script([^>]+)>/g)) {
    const attrs = m[1]!;
    const src = /\ssrc="([^"]+\.js)"/.exec(attrs)?.[1];
    if (src && !/\snomodule/i.test(attrs)) js.add(src);
  }
  for (const m of html.matchAll(/<link[^>]+href="([^"]+\.css)"/g)) css.add(m[1]!);
  return { js: [...js], css: [...css] };
}

function gzipKb(urlPath: string): number {
  const file = join("out", decodeURI(urlPath.replace(/^\//, "").split("?")[0]!));
  return gzipSync(readFileSync(file), { level: 9 }).length / 1024;
}

function main(): void {
  const html = readFileSync("out/index.html", "utf8");
  const { js, css } = assetsOf(html);
  const jsKb = js.reduce((sum, f) => sum + gzipKb(f), 0) + gzipSync(html).length / 1024;
  const cssKb = css.reduce((sum, f) => sum + gzipKb(f), 0);
  const line = (label: string, kb: number, budget: number) =>
    `${label.padEnd(4)} ${kb.toFixed(1).padStart(6)} KB gzipped (budget ${budget} KB)`;
  console.log(line("JS", jsKb, JS_BUDGET_KB) + "  incl. the HTML");
  console.log(line("CSS", cssKb, CSS_BUDGET_KB));
  if (jsKb > JS_BUDGET_KB || cssKb > CSS_BUDGET_KB) {
    console.error("Over budget.");
    process.exit(1);
  }
}

if (process.argv[1]?.endsWith("size-check.ts")) main();
