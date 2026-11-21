import { describe, expect, it } from "vitest";
import { initials } from "@/lib/text";

describe("initials", () => {
  it.each([
    ["Vinícius Albuquerque", "VA"],
    ["Vinícius Albuquerque Barros", "VB"],
    ["ana", "A"],
    ["  élio   souza ", "ÉS"],
    ["", ""],
    ["😀 Emoji", "😀E"],
  ])("%j → %j", (name, expected) => {
    expect(initials(name)).toBe(expected);
  });
});
