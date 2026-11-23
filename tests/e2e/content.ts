// What the e2e tests expect, read from content/links.json through the app's own
// loader, so the tests follow whatever content a fork puts there.
import { t } from "@/content/strings";
import { getContent } from "@/lib/content";
import { LOCALE_INFO, LOCALES, type Locale } from "@/lib/i18n";
import { pageTitle } from "@/lib/metadata";
import type { Block, FeaturedBlock, HeaderBlock, LinkBlock } from "@/lib/schema";
import { absoluteUrl } from "@/lib/url";

export type Card = LinkBlock | FeaturedBlock;

export { absoluteUrl, LOCALE_INFO, LOCALES, pageTitle, t };
export type { Locale };

export const content = (locale: Locale) => getContent(locale);

export const SITE = getContent("en").profile.siteUrl;

export const isCard = (block: Block): block is Card => block.type !== "header";

export const cards = (locale: Locale): Card[] => content(locale).blocks.filter(isCard);

export const headers = (locale: Locale): HeaderBlock[] =>
  content(locale).blocks.filter((block): block is HeaderBlock => block.type === "header");

/** Cards with a share button: everything but e-mail links. */
export const shareable = (locale: Locale): Card[] =>
  cards(locale).filter((card) => !card.url.startsWith("mailto:"));

/** Matches an accessible name that starts with `text` (cards append a hint). */
export const startsWith = (text: string) =>
  new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
