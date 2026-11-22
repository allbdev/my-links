import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { localize, parseContent } from "@/lib/content";
import { buildMetadata, pageTitle } from "@/lib/metadata";

const raw = parseContent(readFileSync("tests/fixtures/localized-links.json", "utf8"), () => true);
const en = localize(raw, "en");
const pt = localize(raw, "pt");

describe("metadata", () => {
  it("titles the page with the name", () => {
    expect(pageTitle(en)).toBe("Ana Teste · Links");
  });

  it("comes from links.json, in English at /", () => {
    const metadata = buildMetadata(en, "en");
    expect(metadata.metadataBase?.toString()).toBe("https://links.example.com/");
    expect(metadata.title).toBe("Ana Teste · Links");
    expect(metadata.description).toBe("Builds things for the web.");
    expect(metadata.alternates?.canonical).toBe("/");
    expect(metadata.openGraph).toMatchObject({
      locale: "en_US",
      alternateLocale: ["pt_BR"],
      url: "/",
      title: "Ana Teste · Links",
      description: "Builds things for the web.",
    });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
  });

  it("is in Portuguese at /pt/", () => {
    const metadata = buildMetadata(pt, "pt");
    expect(metadata.description).toBe("Faz coisas na web.");
    expect(metadata.alternates?.canonical).toBe("/pt/");
    expect(metadata.openGraph).toMatchObject({
      locale: "pt_BR",
      alternateLocale: ["en_US"],
      url: "/pt/",
    });
  });

  it("links every language version with hreflang, English as the default", () => {
    for (const [content, locale] of [
      [en, "en"],
      [pt, "pt"],
    ] as const) {
      expect(buildMetadata(content, locale).alternates?.languages).toEqual({
        en: "/",
        "pt-BR": "/pt/",
        "x-default": "/",
      });
    }
  });
});
