import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, isLocale, LOCALE_INFO, LOCALES, languageAlternates } from "@/lib/i18n";

describe("i18n", () => {
  it("serves English by default at the root", () => {
    expect(DEFAULT_LOCALE).toBe("en");
    expect(LOCALES[0]).toBe(DEFAULT_LOCALE);
    expect(LOCALE_INFO[DEFAULT_LOCALE].path).toBe("/");
  });

  it("puts every other language under its own folder, with a trailing slash", () => {
    for (const locale of LOCALES.filter((l) => l !== DEFAULT_LOCALE)) {
      expect(LOCALE_INFO[locale].path).toBe(`/${locale}/`);
    }
  });

  it("uses Brazilian Portuguese tags for pt", () => {
    expect(LOCALE_INFO.pt).toMatchObject({ htmlLang: "pt-BR", ogLocale: "pt_BR" });
  });

  it("recognises its locales only", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("pt")).toBe(true);
    expect(isLocale("es")).toBe(false);
    expect(isLocale("pt-BR")).toBe(false);
  });

  it("lists hreflang alternates with the default as x-default", () => {
    expect(languageAlternates()).toEqual({ en: "/", "pt-BR": "/pt/", "x-default": "/" });
  });
});
