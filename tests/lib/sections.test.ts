import { describe, expect, it } from "vitest";
import type { Block } from "@/lib/schema";
import { groupSections } from "@/lib/sections";

const link = (title: string): Block => ({ type: "link", title, url: "https://example.com" });
const header = (title: string): Block => ({ type: "header", title });

const shape = (blocks: Block[]) =>
  groupSections(blocks).map((s) => ({
    id: s.id,
    heading: s.heading?.title,
    items: s.items.map((i) => i.title),
  }));

describe("groupSections", () => {
  it("puts links before the first header in a section without a heading", () => {
    expect(shape([link("a"), link("b"), header("H"), link("c")])).toEqual([
      { id: "section-0", heading: undefined, items: ["a", "b"] },
      { id: "section-1", heading: "H", items: ["c"] },
    ]);
  });

  it("starts with a heading when the first block is a header", () => {
    expect(shape([header("H"), link("a")])).toEqual([
      { id: "section-0", heading: "H", items: ["a"] },
    ]);
  });

  it("drops empty sections and keeps ids consecutive", () => {
    expect(shape([header("A"), header("B"), link("x"), header("C")])).toEqual([
      { id: "section-0", heading: "B", items: ["x"] },
    ]);
  });

  it("returns nothing for no blocks", () => {
    expect(groupSections([])).toEqual([]);
  });
});
