import { describe, expect, it } from "vitest";
import { headersFor, type HeaderRule, loadHeaderRules } from "../../tools/vercel-headers";

const RULES: HeaderRule[] = [
  { source: "/(.*)", headers: [{ key: "X-Frame-Options", value: "DENY" }] },
  { source: "/opengraph-image", headers: [{ key: "Content-Type", value: "image/png" }] },
  { source: "/_next/static/(.*)", headers: [{ key: "Cache-Control", value: "immutable" }] },
];

describe("vercel.json headers", () => {
  it("matches catch-all, literal and prefix sources", () => {
    expect(headersFor("/", RULES)).toEqual({ "x-frame-options": "DENY" });
    expect(headersFor("/opengraph-image", RULES)).toEqual({
      "x-frame-options": "DENY",
      "content-type": "image/png",
    });
    expect(headersFor("/opengraph-image/x", RULES)).toEqual({ "x-frame-options": "DENY" });
    expect(headersFor("/_next/static/a.js", RULES)["cache-control"]).toBe("immutable");
  });

  it("rejects source patterns it can't emulate", () => {
    expect(() => headersFor("/", [{ source: "/:path*", headers: [] }])).toThrow(/Unsupported/);
  });

  it("serves the extensionless image routes as PNG", () => {
    const rules = loadHeaderRules();
    // Route groups make Next add a hash to the Open Graph image's name.
    for (const path of ["/opengraph-image-35z9bs", "/pt/opengraph-image-1upmk7", "/apple-icon"]) {
      expect(headersFor(path, rules)["content-type"], path).toBe("image/png");
    }
    for (const path of ["/", "/pt/", "/sitemap.xml"]) {
      expect(headersFor(path, rules)["content-type"], path).toBeUndefined();
    }
  });
});
