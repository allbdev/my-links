import { describe, expect, it } from "vitest";
import { STRINGS, t, type StringKey } from "@/content/strings";

describe("interface strings", () => {
  it("has no empty or untrimmed strings", () => {
    for (const [key, value] of Object.entries(STRINGS)) {
      expect(value, key).not.toBe("");
      expect(value, key).toBe(value.trim());
    }
  });

  it("fills slots", () => {
    expect(t("share.link", { title: "GitHub" })).toBe("Compartilhar link: GitHub");
    expect(t("profile.photo", { name: "Ana" })).toBe("Foto de Ana");
  });

  it("returns strings without slots unchanged", () => {
    expect(t("share.copy")).toBe("Copiar link");
  });

  it("throws on a missing slot", () => {
    expect(() => t("share.link")).toThrow(/title/);
  });

  it("only uses word slots", () => {
    for (const key of Object.keys(STRINGS) as StringKey[]) {
      const braces = STRINGS[key].match(/[{}]/g) ?? [];
      const slots = STRINGS[key].match(/\{\w+\}/g) ?? [];
      expect(braces.length, key).toBe(slots.length * 2);
    }
  });
});
