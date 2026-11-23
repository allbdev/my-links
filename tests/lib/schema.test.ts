import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contentSchema, formatIssues } from "@/lib/schema";

type Json = Record<string, unknown>;
type Fixture = Json & { profile: Json; socials: Json[]; blocks: Json[] };
const VALID = JSON.parse(readFileSync("tests/fixtures/valid-links.json", "utf8")) as Fixture;

/** A deep copy of the valid fixture with `mutate` applied. */
function variant(mutate: (c: Fixture) => void): Fixture {
  const copy = structuredClone(VALID);
  mutate(copy);
  return copy;
}

/** The formatted error for `input`, or "" when it parses. */
function errorsOf(input: unknown): string {
  const result = contentSchema.safeParse(input);
  return result.success ? "" : formatIssues(result.error);
}

describe("content schema", () => {
  it("accepts the valid fixture", () => {
    expect(errorsOf(VALID)).toBe("");
  });

  it("accepts a link with neither icon nor image, and a profile without avatar or repo", () => {
    const input = variant((c) => {
      delete c.profile.avatar;
      delete c.profile.repoUrl;
      delete c.profile.author;
      c.socials = [];
    });
    expect(errorsOf(input)).toBe("");
  });

  describe("per-language values", () => {
    const LOCALIZED = JSON.parse(
      readFileSync("tests/fixtures/localized-links.json", "utf8"),
    ) as Fixture;

    it("accepts one value per language, mixed with plain values", () => {
      expect(errorsOf(LOCALIZED)).toBe("");
    });

    it("needs every language", () => {
      const input = variant((c) => {
        c.blocks[0]!.title = { en: "Portfolio" };
      });
      expect(errorsOf(input)).toBe(
        'blocks[0].title: must be a string, or an object with one string per language ("en", "pt")',
      );
    });

    it("rejects a language the site doesn't have", () => {
      const input = variant((c) => {
        c.profile.bio = { en: "Hi", pt: "Oi", es: "Hola" };
      });
      expect(errorsOf(input)).toMatch(/^profile\.bio: Unrecognized key: "es"/);
    });

    it("checks each language's value with the same rules", () => {
      const input = variant((c) => {
        c.blocks[0]!.url = { en: "https://example.com", pt: "javascript:alert(1)" };
        c.blocks[2]!.title = { en: "x".repeat(81), pt: "Projetos" };
      });
      const errors = errorsOf(input);
      expect(errors).toContain("blocks[0].url.pt: must be an https:// URL");
      expect(errors).toContain("blocks[2].title.en: must be at most 80 characters");
    });

    it.each(["name", "handle", "siteUrl"])("keeps profile.%s a single value", (field) => {
      const input = variant((c) => {
        c.profile[field] = { en: "a", pt: "b" };
      });
      expect(errorsOf(input)).toMatch(new RegExp(`^profile\\.${field}: `));
    });
  });

  describe("URLs", () => {
    it.each([
      "javascript:alert(1)",
      "JavaScript:alert(1)",
      " javascript:alert(1)",
      "data:text/html,<script>alert(1)</script>",
      "http://example.com",
      "ftp://example.com",
      "//evil.example.com",
      "/../etc/passwd",
      "/a\\b",
      "/\t/evil.example.com",
      "/\n/evil.example.com",
      "/a b.pdf",
      "example.com",
      "",
      "https://user:pass@example.com",
      "mailto:not-an-address",
      "vbscript:msgbox",
    ])("rejects link url %j", (url) => {
      const errors = errorsOf(variant((c) => (c.blocks[0]!.url = url)));
      expect(errors).toContain("blocks[0].url:");
    });

    it.each(["https://example.com", "https://example.com/a?b=c#d", "mailto:a@b.co", "/cv.pdf"])(
      "accepts link url %j",
      (url) => {
        expect(errorsOf(variant((c) => (c.blocks[0]!.url = url)))).toBe("");
      },
    );

    it("rejects a non-https featured url with a readable message", () => {
      const errors = errorsOf(variant((c) => (c.blocks[3]!.url = "javascript:void(0)")));
      expect(errors).toBe(
        'blocks[3].url: must be an https:// URL, a mailto: address, or a path on this site such as "/cv.pdf"',
      );
    });

    it("requires siteUrl to be a bare https origin", () => {
      for (const siteUrl of ["http://a.com", "https://a.com/", "https://a.com/path", "a.com"]) {
        expect(errorsOf(variant((c) => (c.profile.siteUrl = siteUrl)))).toContain(
          "profile.siteUrl:",
        );
      }
    });

    it("requires email socials to be mailto and others https", () => {
      expect(errorsOf(variant((c) => (c.socials[1]!.url = "https://mail.example.com")))).toBe(
        'socials[1].url: must be a mailto: address, e.g. "mailto:me@example.com"',
      );
      expect(errorsOf(variant((c) => (c.socials[0]!.url = "mailto:a@b.co")))).toBe(
        "socials[0].url: must be an https:// URL",
      );
    });

    it("requires the footer author to have a name and an https url", () => {
      expect(
        errorsOf(variant((c) => (c.profile.author = { name: "me", url: "javascript:alert(1)" }))),
      ).toBe("profile.author.url: must be an https:// URL");
      expect(errorsOf(variant((c) => (c.profile.author = { url: "https://a.co" })))).toContain(
        "profile.author.name",
      );
      expect(
        errorsOf(variant((c) => (c.profile.author = { name: "me", url: "https://a.co", x: 1 }))),
      ).toContain("profile.author");
    });
  });

  describe("images and icons", () => {
    it.each(["avatar.svg", "https://cdn.example.com/a.png", "/a.gif", "/../a.png", "//a.png"])(
      "rejects image path %j",
      (image) => {
        expect(errorsOf(variant((c) => (c.blocks[3]!.image = image)))).toContain(
          "blocks[3].image:",
        );
      },
    );

    it("rejects icon and image on the same link", () => {
      const errors = errorsOf(variant((c) => (c.blocks[0]!.image = "/thumbs/projeto.svg")));
      expect(errors).toBe("blocks[0].image: use either icon or image, not both");
    });

    it("rejects an unknown icon, listing the valid ones", () => {
      const errors = errorsOf(variant((c) => (c.blocks[0]!.icon = "unicorn")));
      expect(errors).toMatch(/^blocks\[0\]\.icon: must be one of: github, linkedin/);
    });

    it("requires an image on featured blocks", () => {
      expect(errorsOf(variant((c) => delete c.blocks[3]!.image))).toContain("blocks[3].image:");
    });
  });

  describe("structure", () => {
    it("rejects unknown keys", () => {
      expect(errorsOf(variant((c) => (c.blocks[0]!.titel = "typo")))).toContain("titel");
      expect(errorsOf(variant((c) => (c.profile.nmae = "typo")))).toContain("nmae");
      expect(errorsOf(variant((c) => (c.extra = 1)))).toContain("extra");
    });

    it("rejects an unknown block type", () => {
      expect(errorsOf(variant((c) => (c.blocks[0]!.type = "video")))).toContain("blocks[0]");
    });

    it("allows only one featured block", () => {
      const errors = errorsOf(variant((c) => c.blocks.push({ ...c.blocks[3]! })));
      expect(errors).toBe("blocks[6].type: only one featured block is allowed");
    });

    it("requires at least one block", () => {
      expect(errorsOf(variant((c) => (c.blocks = [])))).toContain("blocks:");
    });

    it("rejects an unknown social type", () => {
      expect(errorsOf(variant((c) => (c.socials[0]!.type = "myspace")))).toContain(
        "socials[0].type: must be one of:",
      );
    });

    it("rejects a bad handle", () => {
      for (const handle of ["", "has space", "a/b", "x".repeat(31)]) {
        expect(errorsOf(variant((c) => (c.profile.handle = handle)))).toContain("profile.handle:");
      }
    });
  });

  describe("text", () => {
    it("trims titles and rejects empty ones", () => {
      expect(errorsOf(variant((c) => (c.blocks[0]!.title = "   ")))).toBe(
        "blocks[0].title: must not be empty",
      );
      const parsed = contentSchema.parse(variant((c) => (c.blocks[0]!.title = "  Oi  ")));
      expect(parsed.blocks[0]!.title).toBe("Oi");
    });

    it("limits lengths", () => {
      expect(errorsOf(variant((c) => (c.blocks[0]!.title = "x".repeat(81))))).toBe(
        "blocks[0].title: must be at most 80 characters",
      );
      expect(errorsOf(variant((c) => (c.profile.bio = "x".repeat(161))))).toBe(
        "profile.bio: must be at most 160 characters",
      );
    });

    it("reports every problem at once", () => {
      const errors = errorsOf(
        variant((c) => {
          c.blocks[0]!.url = "http://a.com";
          c.profile.name = "";
        }),
      );
      expect(errors.split("\n")).toHaveLength(2);
    });
  });
});
