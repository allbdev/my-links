/** The page's languages. The first is the default and is served at "/". */
export const LOCALES = ["en", "pt"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

interface LocaleInfo {
  /** `<html lang>` and `hreflang`. */
  htmlLang: string;
  /** `og:locale`. */
  ogLocale: string;
  /** Where the page lives, with the trailing slash the static export uses. */
  path: string;
}

export const LOCALE_INFO: Record<Locale, LocaleInfo> = {
  en: { htmlLang: "en", ogLocale: "en_US", path: "/" },
  pt: { htmlLang: "pt-BR", ogLocale: "pt_BR", path: "/pt/" },
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** `{ en: "/", "pt-BR": "/pt/", "x-default": "/" }`, for hreflang alternates. */
export function languageAlternates(): Record<string, string> {
  const entries = LOCALES.map((locale) => [LOCALE_INFO[locale].htmlLang, LOCALE_INFO[locale].path]);
  return { ...Object.fromEntries(entries), "x-default": LOCALE_INFO[DEFAULT_LOCALE].path };
}
