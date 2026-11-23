import { describe, expect, it } from "vitest";
import { vercelInsights } from "../../tools/vercel-insights";

describe("Vercel Web Analytics stand-in (preview server)", () => {
  it("serves the loader as JavaScript, so nosniff lets it run", () => {
    const res = vercelInsights("/_vercel/insights/script.js?v=1");
    expect(res?.status).toBe(200);
    expect(res?.type).toMatch(/^text\/javascript/);
  });

  it("accepts page-view beacons with no content", () => {
    expect(vercelInsights("/_vercel/insights/view")).toEqual({ status: 204, body: "" });
  });

  it("leaves every other path to the static files", () => {
    for (const path of ["/", "/pt/", "/_vercel/other", "/_vercel/insights"]) {
      expect(vercelInsights(path), path).toBeNull();
    }
  });
});
