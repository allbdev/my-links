import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { getContent } from "@/lib/content";
import { LOCALE_INFO, type Locale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/metadata";
import { FONT_VARIABLES } from "../fonts";
import "../globals.css";

// Each language is its own root layout (route groups (en) and (pt)), so
// <html lang> is right in the static HTML. These are shared between them.

export const VIEWPORT: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#eceef2",
  colorScheme: "light",
};

export function localeMetadata(locale: Locale): Metadata {
  return buildMetadata(getContent(locale), locale);
}

export function LocaleLayout({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <html lang={LOCALE_INFO[locale].htmlLang} className={FONT_VARIABLES}>
      <body>{children}</body>
    </html>
  );
}
