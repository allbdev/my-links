import Image from "next/image";
import type { ReactNode } from "react";
import type { LinkBlock } from "@/lib/schema";
import { opensInNewTab } from "@/lib/url";
import { Icon } from "./icons/icon";
import styles from "./link-card.module.css";
import { NewTabHint } from "./new-tab-hint";

/** Props for an `<a>` that opens in a new tab when the URL is external. */
export function linkProps(url: string) {
  return opensInNewTab(url) ? { target: "_blank", rel: "noopener noreferrer" } : {};
}

export function LinkCard({ block, share }: { block: LinkBlock; share?: ReactNode }) {
  const hasMedia = Boolean(block.icon || block.image);
  const cardClass = [styles.card, block.highlight && styles.highlight].filter(Boolean).join(" ");
  const linkClass = [styles.link, !hasMedia && styles.plain].filter(Boolean).join(" ");
  return (
    <div className={cardClass}>
      <a className={linkClass} href={block.url} {...linkProps(block.url)}>
        {block.icon && (
          <span className={styles.tile} aria-hidden="true">
            <Icon name={block.icon} size={22} />
          </span>
        )}
        {block.image && (
          <Image
            className={styles.thumb}
            src={block.image}
            alt=""
            width={48}
            height={48}
            loading="lazy"
            unoptimized
          />
        )}
        <span className={styles.title}>{block.title}</span>
        {opensInNewTab(block.url) && <NewTabHint />}
      </a>
      {share && <div className={styles.action}>{share}</div>}
    </div>
  );
}
