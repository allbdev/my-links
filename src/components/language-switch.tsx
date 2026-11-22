import { t } from "@/content/strings";
import { LOCALE_INFO, LOCALES, type Locale } from "@/lib/i18n";
import styles from "./language-switch.module.css";

/**
 * "EN | PT": plain links between the language versions of the page. Each link
 * is labelled in its own language, so screen readers pronounce it right.
 */
export function LanguageSwitch({ locale }: { locale: Locale }) {
  return (
    <nav className={styles.switch} aria-label={t(locale, "locale.nav")}>
      {LOCALES.map((target) => {
        const { htmlLang, path } = LOCALE_INFO[target];
        const current = target === locale;
        return (
          <a
            key={target}
            className={current ? `${styles.option} ${styles.current}` : styles.option}
            href={path}
            hrefLang={htmlLang}
            lang={htmlLang}
            aria-current={current ? "page" : undefined}
          >
            {target.toUpperCase()}{" "}
            <span className="visually-hidden">({t(target, `locale.${target}`)})</span>
          </a>
        );
      })}
    </nav>
  );
}
