// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { Blocks } from "@/components/blocks";
import { localize, parseContent, visibleBlocks } from "@/lib/content";

const content = localize(
  parseContent(readFileSync("tests/fixtures/valid-links.json", "utf8"), () => true),
  "pt",
);
const blocks = visibleBlocks(content.blocks);

describe("Blocks", () => {
  it("renders every visible card in order and skips hidden ones", () => {
    render(<Blocks locale="pt" blocks={blocks} />);
    const names = screen.getAllByRole("link").map((a) => a.textContent);
    expect(names).toEqual([
      "Portfólio (abre em nova aba)",
      "Currículo",
      "Projeto Um projeto Novo (abre em nova aba)",
      "E-mail",
    ]);
    expect(screen.queryByText("Escondido")).toBeNull();
  });

  it("labels each headed section with its heading", () => {
    render(<Blocks locale="pt" blocks={blocks} />);
    const section = screen.getByRole("region", { name: "Projetos" });
    expect(within(section).getAllByRole("listitem")).toHaveLength(2);
  });

  it("puts cards in lists", () => {
    render(<Blocks locale="pt" blocks={blocks} />);
    expect(screen.getAllByRole("list")).toHaveLength(2);
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });

  it("asks for a share control per card", () => {
    render(
      <Blocks
        locale="pt"
        blocks={blocks}
        share={(block) => <button type="button">{`share ${block.title}`}</button>}
      />,
    );
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual([
      "share Portfólio",
      "share Currículo",
      "share Projeto",
      "share E-mail",
    ]);
  });
});
