import { t } from "@/content/strings";
import styles from "./footer.module.css";
import { NewTabHint } from "./new-tab-hint";

export function Footer({ repoUrl }: { repoUrl?: string }) {
  return (
    <footer>
      <p className={styles.footer}>
        {t("footer.builtWith")}
        {repoUrl && (
          <>
            {" · "}
            <a href={repoUrl} target="_blank" rel="noopener noreferrer">
              {t("footer.code")}
              <NewTabHint />
            </a>
          </>
        )}
      </p>
    </footer>
  );
}
