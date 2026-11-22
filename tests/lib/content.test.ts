import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  checkPublicFile,
  ContentError,
  getContent,
  isLfsPointer,
  localize,
  parseContent,
  publicFileExists,
  visibleBlocks,
} from "@/lib/content";
import { avatarDataUri } from "@/lib/og";
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

describe("checkPublicFile", () => {
  const dir = mkdtempSync(join(tmpdir(), "links-public-"));
  mkdirSync(join(dir, "thumbs"));
  writeFileSync(
    join(dir, "real.png"),
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  );
  writeFileSync(
    join(dir, "thumbs", "pointer.png"),
    "version https://git-lfs.github.com/spec/v1\noid sha256:abc\nsize 123\n",
  );

  it("accepts a real file", () => {
    expect(isLfsPointer("/real.png", dir)).toBe(false);
    expect(checkPublicFile("/real.png", dir)).toBe(true);
  });

  it("reports a missing file as missing", () => {
    expect(checkPublicFile("/nope.png", dir)).toBe(false);
  });

  it("explains a Git LFS pointer instead of failing later with a broken image", () => {
    expect(isLfsPointer("/thumbs/pointer.png", dir)).toBe(true);
    expect(checkPublicFile("/thumbs/pointer.png", dir)).toMatch(
      /^public\/thumbs\/pointer\.png is a Git LFS pointer, not the file/,
    );
  });

  it("puts that explanation in the content error", () => {
    expect(() =>
      parseContent(RAW, (path) => (path === "/avatar.svg" ? "is a pointer" : true)),
    ).toThrow(/profile\.avatar: is a pointer/);
  });
});

describe("public/", () => {
  // Vercel clones without Git LFS, so anything the site serves or the build
  // reads must be a plain file in the repo.
  function files(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)],
    );
  }

  it("has no file tracked by Git LFS", () => {
    const paths = files("public");
    const attrs = execFileSync("git", ["check-attr", "filter", "--", ...paths], {
      encoding: "utf8",
    });
    expect(attrs.split("\n").filter((line) => line.endsWith(": lfs"))).toEqual([]);
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

describe("localize", () => {
  const raw = parseContent(
    readFileSync("tests/fixtures/localized-links.json", "utf8"),
    allFilesExist,
  );

  it("picks each language's value and shares plain ones", () => {
    const en = localize(raw, "en");
    const pt = localize(raw, "pt");
    expect(en.profile.bio).toBe("Builds things for the web.");
    expect(pt.profile.bio).toBe("Faz coisas na web.");
    expect(en.blocks.map((b) => b.title)).toEqual(["Portfolio", "GitHub", "Projects", "Projeto"]);
    expect(pt.blocks.map((b) => b.title)).toEqual(["Portfólio", "GitHub", "Projetos", "Projeto"]);
    expect(en.blocks[0]).toMatchObject({ url: "https://example.com/en", icon: "globe" });
    expect(pt.blocks[0]).toMatchObject({ url: "https://example.com/pt", icon: "globe" });
    expect(pt.blocks[3]).toMatchObject({ subtitle: "Um projeto", badge: "Novo" });
  });

  it("leaves content without per-language values as it is", () => {
    const plain = parseContent(RAW, allFilesExist);
    expect(localize(plain, "en")).toEqual(plain);
  });

  it("doesn't change its input", () => {
    const before = structuredClone(raw);
    localize(raw, "pt");
    expect(raw).toEqual(before);
  });
});

describe("content/links.json", () => {
  it.each(["en", "pt"] as const)("is valid in %s and every image exists", (locale) => {
    const content = getContent(locale);
    expect(content.blocks.length).toBeGreaterThan(0);
    expect(content.profile.siteUrl).toBe("https://links.vinicius-albuquerque.com.br");
  });

  it("resolves to plain text in every language", () => {
    for (const locale of ["en", "pt"] as const) {
      const { profile, blocks } = getContent(locale);
      const texts = [profile.bio, ...blocks.flatMap((b) => Object.values(b))];
      for (const value of texts) expect(typeof value, locale).not.toBe("object");
    }
  });

  it("has a photo the Open Graph image can embed", () => {
    expect(avatarDataUri(getContent("en").profile.avatar)).toMatch(
      /^data:image\/(jpeg|png);base64,/,
    );
  });

  it("differs between languages", () => {
    expect(getContent("en").profile.bio).not.toBe(getContent("pt").profile.bio);
  });
});
