import { t } from "@/content/strings";
import type { Locale } from "@/lib/i18n";
import styles from "./footer.module.css";
import { NewTabHint } from "./new-tab-hint";

export function Footer({ locale, repoUrl }: { locale: Locale; repoUrl?: string }) {
  return (
    <footer>
      <p className={styles.footer}>
        {t(locale, "footer.builtWith")}
        {repoUrl && (
          <>
            {" · "}
            <a href={repoUrl} target="_blank" rel="noopener noreferrer">
              {t(locale, "footer.code")}
              <NewTabHint locale={locale} />
            </a>
          </>
        )}
      </p>
    </footer>
  );
}
