import { describe, expect, it } from "vitest";
import { BOARDS } from "../../tools/designs/boards";

describe("design boards", () => {
  it("have unique, numbered JPG file names", () => {
    const files = BOARDS.map((b) => b.file);
    expect(new Set(files).size).toBe(files.length);
    for (const file of files) expect(file).toMatch(/^\d{2}-[A-Za-z]+\.jpg$/);
  });
});
