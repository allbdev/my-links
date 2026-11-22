import type { MetadataRoute } from "next";
import { getRawContent } from "@/lib/content";
import { LOCALE_INFO, LOCALES, languageAlternates } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/url";

export const dynamic = "force-static";

/** One entry per language, each listing the others as alternates. */
export default function sitemap(): MetadataRoute.Sitemap {
  const { siteUrl } = getRawContent().profile;
  const languages = Object.fromEntries(
    Object.entries(languageAlternates())
      .filter(([lang]) => lang !== "x-default")
      .map(([lang, path]) => [lang, absoluteUrl(path, siteUrl)]),
  );
  return LOCALES.map((locale) => ({
    url: absoluteUrl(LOCALE_INFO[locale].path, siteUrl),
    changeFrequency: "monthly",
    priority: 1,
    alternates: { languages },
  }));
}
