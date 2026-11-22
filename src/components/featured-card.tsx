import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import type { FeaturedBlock } from "@/lib/schema";
import { opensInNewTab } from "@/lib/url";
import { StaticImage } from "./static-image";
import styles from "./featured-card.module.css";
import { linkProps } from "./link-card";
import { NewTabHint } from "./new-tab-hint";

export function FeaturedCard({
  locale,
  block,
  share,
}: {
  locale: Locale;
  block: FeaturedBlock;
  share?: ReactNode;
}) {
  return (
    <div className={styles.card}>
      <a className={styles.link} href={block.url} {...linkProps(block.url)}>
        <span className={styles.media}>
          <StaticImage
            className={styles.image}
            src={block.image}
            alt=""
            width={800}
            height={400}
            priority
          />
        </span>
        <span className={styles.text}>
          <span className={styles.title}>{block.title}</span>
          {block.subtitle && (
            <>
              {" "}
              <span className={styles.subtitle}>{block.subtitle}</span>
            </>
          )}
        </span>
        {block.badge && (
          <>
            {" "}
            {/* After the text in reading order; drawn over the image. */}
            <span className={styles.badge}>{block.badge}</span>
          </>
        )}
        {opensInNewTab(block.url) && <NewTabHint locale={locale} />}
      </a>
      {share && <div className={styles.action}>{share}</div>}
    </div>
  );
}
