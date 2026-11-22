// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BLOCKS_ENTER_START, Blocks } from "@/components/blocks";
import { cx, enter } from "@/components/enter";
import { Profile } from "@/components/profile";
import { localize, parseContent, visibleBlocks } from "@/lib/content";

const content = localize(
  parseContent(readFileSync("tests/fixtures/valid-links.json", "utf8"), () => true),
  "pt",
);

const indexOf = (el: Element) => (el as HTMLElement).style.getPropertyValue("--enter-index");

describe("enter", () => {
  it("returns the class and the element's place in the stagger", () => {
    const props = enter(3);
    expect(props.className).toBe("enter");
    expect(props.style).toEqual({ "--enter-index": 3 });
  });

  it("joins class names and skips empty ones", () => {
    expect(cx("a", false, undefined, "b")).toBe("a b");
  });
});

describe("page entrance order", () => {
  it("staggers the profile: photo, name, bio, socials", () => {
    render(<Profile locale="pt" profile={content.profile} socials={content.socials} />);
    const parts = [
      screen.getByRole("img", { name: /Ana Teste/ }),
      screen.getByRole("heading", { level: 1 }),
      screen.getByText(content.profile.bio),
      screen.getByRole("list", { name: "Redes" }),
    ];
    parts.forEach((el, i) => {
      expect(el).toHaveClass("enter");
      expect(indexOf(el)).toBe(String(i));
    });
  });

  it("continues with each heading and card, in page order", () => {
    const { container } = render(<Blocks locale="pt" blocks={visibleBlocks(content.blocks)} />);
    const staggered = [...container.querySelectorAll(".enter")];
    // Two cards, the "Projetos" heading, then two more cards.
    expect(staggered).toHaveLength(5);
    expect(staggered.map(indexOf)).toEqual(
      [0, 1, 2, 3, 4].map((i) => String(BLOCKS_ENTER_START + i)),
    );
    expect(staggered[2]).toHaveTextContent("Projetos");
  });
});
