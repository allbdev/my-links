import type { ReactNode } from "react";
import { type CardBlock, groupSections } from "@/lib/sections";
import type { Locale } from "@/lib/i18n";
import type { Block } from "@/lib/schema";
import styles from "./blocks.module.css";
import { enter } from "./enter";
import { FeaturedCard } from "./featured-card";
import { LinkCard } from "./link-card";
import { SectionHeading } from "./section-heading";

/** Where the blocks start in the page entrance: after the profile's four parts. */
export const BLOCKS_ENTER_START = 4;

/** Renders the blocks in order, grouped into sections at each header. */
export function Blocks({
  locale,
  blocks,
  share,
}: {
  locale: Locale;
  blocks: readonly Block[];
  /** The share control for one card, if any. */
  share?: (block: CardBlock) => ReactNode;
}) {
  let order = BLOCKS_ENTER_START;
  return groupSections(blocks).map((section) => (
    <section
      key={section.id}
      className={styles.section}
      {...(section.heading ? { "aria-labelledby": section.id } : {})}
    >
      {section.heading && (
        <div {...enter(order++)}>
          <SectionHeading id={section.id} title={section.heading.title} />
        </div>
      )}
      <ul className={styles.list} role="list">
        {section.items.map((block, index) => (
          <li key={`${index}-${block.url}`} {...enter(order++)}>
            {block.type === "featured" ? (
              <FeaturedCard locale={locale} block={block} share={share?.(block)} />
            ) : (
              <LinkCard locale={locale} block={block} share={share?.(block)} />
            )}
          </li>
        ))}
      </ul>
    </section>
  ));
}
