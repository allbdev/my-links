import fc from "fast-check";
import { describe, expect, it } from "vitest";

describe("test setup", () => {
  it("runs property tests", () => {
    fc.assert(fc.property(fc.string(), (s) => s.length >= 0));
    expect(true).toBe(true);
  });
});
