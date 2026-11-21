import type { ReactNode } from "react";
import { type CardBlock, groupSections } from "@/lib/sections";
import type { Block } from "@/lib/schema";
import styles from "./blocks.module.css";
import { FeaturedCard } from "./featured-card";
import { LinkCard } from "./link-card";
import { SectionHeading } from "./section-heading";

/** Renders the blocks in order, grouped into sections at each header. */
export function Blocks({
  blocks,
  share,
}: {
  blocks: readonly Block[];
  /** The share control for one card, if any. */
  share?: (block: CardBlock) => ReactNode;
}) {
  return groupSections(blocks).map((section) => (
    <section
      key={section.id}
      className={styles.section}
      {...(section.heading ? { "aria-labelledby": section.id } : {})}
    >
      {section.heading && <SectionHeading id={section.id} title={section.heading.title} />}
      <ul className={styles.list} role="list">
        {section.items.map((block, index) => (
          <li key={`${index}-${block.url}`}>
            {block.type === "featured" ? (
              <FeaturedCard block={block} share={share?.(block)} />
            ) : (
              <LinkCard block={block} share={share?.(block)} />
            )}
          </li>
        ))}
      </ul>
    </section>
  ));
}
