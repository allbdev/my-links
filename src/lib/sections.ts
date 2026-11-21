import type { Block, FeaturedBlock, HeaderBlock, LinkBlock } from "./schema";

export type CardBlock = LinkBlock | FeaturedBlock;

export interface Section {
  /** Stable id for aria-labelledby: "section-0", "section-1", … */
  id: string;
  heading?: HeaderBlock;
  items: CardBlock[];
}

/**
 * Splits blocks into sections at each header, keeping the order. Links before
 * the first header form a section without a heading. Empty sections are dropped.
 */
export function groupSections(blocks: readonly Block[]): Section[] {
  const sections: Omit<Section, "id">[] = [];
  let current: Omit<Section, "id"> = { items: [] };
  for (const block of blocks) {
    if (block.type === "header") {
      sections.push(current);
      current = { heading: block, items: [] };
    } else {
      current.items.push(block);
    }
  }
  sections.push(current);
  return sections
    .filter((section) => section.items.length > 0)
    .map((section, index) => ({ id: `section-${index}`, ...section }));
}
