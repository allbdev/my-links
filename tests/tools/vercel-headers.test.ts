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

  it("serves the Open Graph image as a PNG", () => {
    expect(headersFor("/opengraph-image", loadHeaderRules())["content-type"]).toBe("image/png");
  });
});
