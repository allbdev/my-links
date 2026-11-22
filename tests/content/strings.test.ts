import { describe, expect, it } from "vitest";
import { STRINGS, t, type StringKey } from "@/content/strings";
import { LOCALES } from "@/lib/i18n";

const slotsOf = (value: string) => (value.match(/\{\w+\}/g) ?? []).sort();

describe("interface strings", () => {
  it.each(LOCALES)("has no empty or untrimmed strings in %s", (locale) => {
    for (const [key, value] of Object.entries(STRINGS[locale])) {
      expect(value, key).not.toBe("");
      expect(value, key).toBe(value.trim());
    }
  });

  it("has the same keys and slots in every language", () => {
    const keys = Object.keys(STRINGS.en).sort();
    for (const locale of LOCALES) {
      expect(Object.keys(STRINGS[locale]).sort(), locale).toEqual(keys);
      for (const key of keys as StringKey[]) {
        expect(slotsOf(STRINGS[locale][key]), `${locale} ${key}`).toEqual(slotsOf(STRINGS.en[key]));
      }
    }
  });

  it("fills slots in each language", () => {
    expect(t("en", "share.link", { title: "GitHub" })).toBe("Share link: GitHub");
    expect(t("pt", "share.link", { title: "GitHub" })).toBe("Compartilhar link: GitHub");
    expect(t("en", "profile.photo", { name: "Ana" })).toBe("Photo of Ana");
    expect(t("pt", "profile.photo", { name: "Ana" })).toBe("Foto de Ana");
  });

  it("returns strings without slots unchanged", () => {
    expect(t("en", "share.copy")).toBe("Copy link");
    expect(t("pt", "share.copy")).toBe("Copiar link");
  });

  it("throws on a missing slot", () => {
    expect(() => t("en", "share.link")).toThrow(/title/);
  });

  it("names each language in its own language", () => {
    for (const locale of LOCALES) {
      expect(t(locale, "locale.en")).toBe("English");
      expect(t(locale, "locale.pt")).toBe("Português");
    }
  });

  it.each(LOCALES)("only uses word slots in %s", (locale) => {
    for (const [key, value] of Object.entries(STRINGS[locale])) {
      const braces = value.match(/[{}]/g) ?? [];
      expect(braces.length, key).toBe(slotsOf(value).length * 2);
    }
  });
});
