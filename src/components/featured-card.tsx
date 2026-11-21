import Image from "next/image";
import type { ReactNode } from "react";
import type { FeaturedBlock } from "@/lib/schema";
import { opensInNewTab } from "@/lib/url";
import styles from "./featured-card.module.css";
import { linkProps } from "./link-card";
import { NewTabHint } from "./new-tab-hint";

export function FeaturedCard({ block, share }: { block: FeaturedBlock; share?: ReactNode }) {
  return (
    <div className={styles.card}>
      <a className={styles.link} href={block.url} {...linkProps(block.url)}>
        <span className={styles.media}>
          <Image
            className={styles.image}
            src={block.image}
            alt=""
            width={800}
            height={400}
            sizes="(min-width: 480px) 446px, calc(100vw - 50px)"
            unoptimized
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
        {opensInNewTab(block.url) && <NewTabHint />}
      </a>
      {share && <div className={styles.action}>{share}</div>}
    </div>
  );
}
