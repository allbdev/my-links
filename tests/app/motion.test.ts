import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Guards for the motion rules in CLAUDE.md / the animate checklist: these
// read the CSS, since jsdom doesn't run animations.

function cssFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return cssFiles(path);
    return path.endsWith(".css") ? [path] : [];
  });
}

const FILES = cssFiles("src").map((path) => ({ path, css: readFileSync(path, "utf8") }));

describe("motion CSS", () => {
  it.each(FILES)("$path names its transitions and avoids ease-in and scale(0)", ({ css }) => {
    expect(css).not.toMatch(/transition:\s*all\b/);
    expect(css).not.toMatch(/\bease-in\b(?!-out)/);
    expect(css).not.toMatch(/scale\(0\)/);
  });

  it.each(
    FILES.filter(
      ({ css }) =>
        /transform:(?!\s*none)/.test(css) && /:(hover|active)|\.enter|@starting-style/.test(css),
    ),
  )("$path tones its movement down for reduced motion", ({ css }) => {
    expect(css).toContain("prefers-reduced-motion: reduce");
  });

  it("gates hover movement behind a fine pointer", () => {
    for (const { path, css } of FILES) {
      // A hover rule that moves something must sit inside the hover media query.
      const outside = css.replace(
        /@media \(hover: hover\) and \(pointer: fine\) \{[\s\S]*?\n\}/g,
        "",
      );
      expect(outside, path).not.toMatch(/:hover[^{]*\{[^}]*transform:(?!\s*none)/);
    }
  });

  it("only switches the language with a view transition when motion is welcome", () => {
    const globals = readFileSync("src/app/globals.css", "utf8");
    expect(globals).toMatch(
      /@media \(prefers-reduced-motion: no-preference\) \{\s*@view-transition \{\s*navigation: auto;/,
    );
  });

  it("defines the motion tokens", () => {
    const tokens = readFileSync("src/app/tokens.css", "utf8");
    expect(tokens).toContain("--ease-out: cubic-bezier(0.23, 1, 0.32, 1);");
    expect(tokens).toContain("--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);");
    for (const name of ["press", "hover", "enter", "modal-in", "modal-out"]) {
      expect(tokens).toMatch(new RegExp(`--duration-${name}: \\d+ms;`));
    }
  });
});
