import { describe, expect, it } from "vitest";
import { absoluteUrl, displayUrl, opensInNewTab } from "@/lib/url";

const SITE = "https://links.example.com";

describe("absoluteUrl", () => {
  it("resolves site paths against siteUrl", () => {
    expect(absoluteUrl("/cv.pdf", SITE)).toBe("https://links.example.com/cv.pdf");
    expect(absoluteUrl("/", SITE)).toBe("https://links.example.com/");
  });

  it("leaves absolute URLs alone", () => {
    expect(absoluteUrl("https://github.com/a", SITE)).toBe("https://github.com/a");
    expect(absoluteUrl("mailto:a@b.co", SITE)).toBe("mailto:a@b.co");
  });
});

describe("opensInNewTab", () => {
  it.each([
    ["https://github.com", true],
    ["mailto:a@b.co", false],
    ["/cv.pdf", false],
  ])("%s → %s", (href, expected) => {
    expect(opensInNewTab(href)).toBe(expected);
  });
});

describe("displayUrl", () => {
  it.each([
    ["https://links.example.com", "links.example.com"],
    ["https://www.path-trader.com.br/", "www.path-trader.com.br"],
    ["https://example.com/a/b", "example.com/a/b"],
    ["mailto:a@b.co", "a@b.co"],
    ["mailto:a@b.co?subject=x", "a@b.co"],
  ])("%s → %s", (url, expected) => {
    expect(displayUrl(url)).toBe(expected);
  });
});
