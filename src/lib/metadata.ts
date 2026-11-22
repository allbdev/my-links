import type { Metadata } from "next";
import { LOCALE_INFO, LOCALES, type Locale, languageAlternates } from "./i18n";
import type { Content } from "./schema";

export const SITE_TITLE_SUFFIX = "Links";

/** The page title: "Name · Links". */
export function pageTitle(content: Content): string {
  return `${content.profile.name} · ${SITE_TITLE_SUFFIX}`;
}

/** Everything that goes in <head> for the page in `locale`, from links.json. */
export function buildMetadata(content: Content, locale: Locale): Metadata {
  const { profile } = content;
  const title = pageTitle(content);
  const { path, ogLocale } = LOCALE_INFO[locale];
  return {
    metadataBase: new URL(profile.siteUrl),
    title,
    description: profile.bio,
    applicationName: title,
    authors: [{ name: profile.name, url: profile.siteUrl }],
    alternates: { canonical: path, languages: languageAlternates() },
    openGraph: {
      type: "profile",
      locale: ogLocale,
      alternateLocale: LOCALES.filter((other) => other !== locale).map(
        (other) => LOCALE_INFO[other].ogLocale,
      ),
      url: path,
      siteName: title,
      title,
      description: profile.bio,
      username: profile.handle,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: profile.bio,
    },
    robots: { index: true, follow: true },
    formatDetection: { email: false, telephone: false, address: false },
  };
}
