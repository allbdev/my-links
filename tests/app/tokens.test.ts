import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contrast } from "../helpers/contrast";

const css = readFileSync("src/app/tokens.css", "utf8");
const token = (name: string): string => {
  const m = new RegExp(`--${name}:\\s*([^;]+);`).exec(css);
  if (!m) throw new Error(`Missing token --${name}`);
  return m[1]!.trim();
};

describe("design tokens", () => {
  it("defines every colour from PLAN.md §7", () => {
    const expected = {
      bg: "#eceef2",
      card: "#ffffff",
      ink: "#12151a",
      muted: "#5b6270",
      line: "#dde1e7",
      hover: "#f1f3f6",
      accent: "#2546e8",
      "accent-soft": "#e8ecff",
      ok: "#1a7a43",
      badge: "#ffd43b",
      "badge-ink": "#a4161a",
      "line-card": "#e1e4ea",
      "on-ink-muted": "#c9ced6",
      "brand-whatsapp": "#1f8f4e",
      "brand-linkedin": "#0a66c2",
    };
    for (const [name, value] of Object.entries(expected)) {
      expect(token(name)).toBe(value);
    }
  });

  it.each([
    ["ink on bg", "ink", "bg"],
    ["ink on card", "ink", "card"],
    ["muted on bg", "muted", "bg"],
    ["muted on card", "muted", "card"],
    ["muted on hover", "muted", "hover"],
    ["card on ink (highlighted card)", "card", "ink"],
    ["card on accent", "card", "accent"],
    ["accent on card", "accent", "card"],
    ["ok on card", "ok", "card"],
    ["ink on badge", "ink", "badge"],
    ["accent on accent-soft", "accent", "accent-soft"],
    ["badge-ink on badge", "badge-ink", "badge"],
    ["on-ink-muted on ink (share preview URL)", "on-ink-muted", "ink"],
  ])("text contrast passes 4.5:1: %s", (_label, fg, bg) => {
    expect(contrast(token(fg), token(bg))).toBeGreaterThanOrEqual(4.5);
  });

  it.each([
    ["card icon on brand-whatsapp", "card", "brand-whatsapp"],
    ["card icon on brand-linkedin", "card", "brand-linkedin"],
    ["card icon on ink", "card", "ink"],
    ["ink icon on bg", "ink", "bg"],
  ])("icon contrast passes 3:1: %s", (_label, fg, bg) => {
    expect(contrast(token(fg), token(bg))).toBeGreaterThanOrEqual(3);
  });
});
