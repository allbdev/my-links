import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  ContentError,
  getContent,
  parseContent,
  publicFileExists,
  visibleBlocks,
} from "@/lib/content";
import type { Block } from "@/lib/schema";

const RAW = readFileSync("tests/fixtures/valid-links.json", "utf8");
const allFilesExist = () => true;

describe("parseContent", () => {
  it("returns typed content for a valid file", () => {
    const content = parseContent(RAW, allFilesExist);
    expect(content.profile.name).toBe("Ana Teste");
    expect(content.blocks).toHaveLength(6);
  });

  it("explains invalid JSON", () => {
    expect(() => parseContent("{ nope", allFilesExist)).toThrow(ContentError);
    expect(() => parseContent("{ nope", allFilesExist)).toThrow(
      /^content\/links\.json is not valid JSON: /,
    );
  });

  it("lists schema problems with their paths", () => {
    const broken = RAW.replace('"https://example.com"', '"javascript:alert(1)"');
    expect(() => parseContent(broken, allFilesExist)).toThrow(
      /content\/links\.json has problems:\nblocks\[0\]\.url: must be an https:\/\/ URL/,
    );
  });

  it("reports every missing image", () => {
    let message = "";
    try {
      parseContent(RAW, () => false);
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toBe(
      [
        "content/links.json has problems:",
        "profile.avatar: file not found: public/avatar.svg",
        "blocks[3].image: file not found: public/thumbs/projeto.svg",
      ].join("\n"),
    );
  });

  it("names the source file in errors", () => {
    expect(() => parseContent("[", allFilesExist, "other.json")).toThrow(/^other\.json /);
  });
});

describe("visibleBlocks", () => {
  const link = (title: string, hidden?: boolean): Block => ({
    type: "link",
    title,
    url: "https://example.com",
    ...(hidden ? { hidden } : {}),
  });
  const header = (title: string, hidden?: boolean): Block => ({
    type: "header",
    title,
    ...(hidden ? { hidden } : {}),
  });
  const titles = (blocks: Block[]) => blocks.map((b) => b.title);

  it("drops hidden blocks and keeps the order", () => {
    expect(titles(visibleBlocks([link("a"), link("b", true), link("c")]))).toEqual(["a", "c"]);
  });

  it("drops a heading whose section is empty", () => {
    const blocks = [header("H1"), link("a", true), header("H2"), link("b"), header("H3")];
    expect(titles(visibleBlocks(blocks))).toEqual(["H2", "b"]);
  });

  it("drops a hidden heading but keeps its links", () => {
    expect(titles(visibleBlocks([header("H", true), link("a")]))).toEqual(["a"]);
  });
});

describe("publicFileExists", () => {
  it("never looks outside public/", () => {
    expect(publicFileExists("/../package.json")).toBe(false);
    expect(publicFileExists("/")).toBe(false);
  });
});

describe("content/links.json", () => {
  it("is valid and every image exists", () => {
    const content = getContent();
    expect(content.blocks.length).toBeGreaterThan(0);
    expect(content.profile.siteUrl).toBe("https://links.vinicius-albuquerque.com.br");
  });
});
