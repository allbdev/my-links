import { Fragment, type ReactNode } from "react";
import { t } from "@/content/strings";
import type { Locale } from "@/lib/i18n";
import styles from "./footer.module.css";
import { NewTabHint } from "./new-tab-hint";

type Author = { name: string; url: string };

function ExternalLink({
  href,
  locale,
  children,
}: {
  href: string;
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <NewTabHint locale={locale} />
    </a>
  );
}

export function Footer({
  locale,
  author,
  repoUrl,
}: {
  locale: Locale;
  author?: Author;
  repoUrl?: string;
}) {
  const parts: { key: string; node: ReactNode }[] = [];
  if (author) {
    parts.push({
      key: "author",
      node: (
        <>
          {t(locale, "footer.builtBy")}{" "}
          <ExternalLink href={author.url} locale={locale}>
            {author.name}
          </ExternalLink>
        </>
      ),
    });
  }
  if (repoUrl) {
    parts.push({
      key: "code",
      node: (
        <ExternalLink href={repoUrl} locale={locale}>
          {t(locale, "footer.code")}
        </ExternalLink>
      ),
    });
  }
  if (parts.length === 0) return null;

  return (
    <footer>
      <p className={styles.footer}>
        {parts.map(({ key, node }, i) => (
          <Fragment key={key}>
            {i > 0 && " · "}
            {node}
          </Fragment>
        ))}
      </p>
    </footer>
  );
}
