import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseContent } from "@/lib/content";
import { buildMetadata, pageTitle } from "@/lib/metadata";

const content = parseContent(readFileSync("tests/fixtures/valid-links.json", "utf8"), () => true);

describe("metadata", () => {
  it("titles the page with the name", () => {
    expect(pageTitle(content)).toBe("Ana Teste · Links");
  });

  it("comes from links.json", () => {
    const metadata = buildMetadata(content);
    expect(metadata.metadataBase?.toString()).toBe("https://links.example.com/");
    expect(metadata.title).toBe("Ana Teste · Links");
    expect(metadata.description).toBe(content.profile.bio);
    expect(metadata.alternates?.canonical).toBe("/");
    expect(metadata.openGraph).toMatchObject({
      locale: "pt_BR",
      url: "/",
      title: "Ana Teste · Links",
      description: content.profile.bio,
    });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
  });
});
