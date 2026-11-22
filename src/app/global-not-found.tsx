import type { Metadata } from "next";
import { t } from "@/content/strings";
import { LOCALE_INFO, LOCALES, DEFAULT_LOCALE } from "@/lib/i18n";
import { FONT_VARIABLES } from "./fonts";
import "./globals.css";
import styles from "./global-not-found.module.css";

// The 404 for any unknown path. There's no single root layout (one per
// language), so this is its own document, in every language.

export const metadata: Metadata = {
  title: `404 · ${t(DEFAULT_LOCALE, "notFound.title")}`,
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang={LOCALE_INFO[DEFAULT_LOCALE].htmlLang} className={FONT_VARIABLES}>
      <body>
        <main className={styles.page}>
          <p className={styles.code} aria-hidden="true">
            404
          </p>
          {LOCALES.map((locale) => {
            const { htmlLang, path } = LOCALE_INFO[locale];
            const Heading = locale === DEFAULT_LOCALE ? "h1" : "p";
            return (
              <div key={locale} className={styles.block} lang={htmlLang}>
                <Heading className={styles.title}>{t(locale, "notFound.title")}</Heading>
                <a className={styles.back} href={path} hrefLang={htmlLang}>
                  {t(locale, "notFound.back")}
                </a>
              </div>
            );
          })}
        </main>
      </body>
    </html>
  );
}
