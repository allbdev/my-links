import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { avatarDataUri, fontsourceFile } from "@/lib/og";

const dir = mkdtempSync(join(tmpdir(), "og-"));
mkdirSync(join(dir, "img"));
writeFileSync(join(dir, "img", "me.png"), Buffer.from([1, 2, 3]));
writeFileSync(join(dir, "me.svg"), "<svg/>");

describe("avatarDataUri", () => {
  it("embeds PNG and JPEG avatars", () => {
    expect(avatarDataUri("/img/me.png", dir)).toBe("data:image/png;base64,AQID");
  });

  it("returns null for SVG, missing files, paths outside public, or no avatar", () => {
    expect(avatarDataUri("/me.svg", dir)).toBeNull();
    expect(avatarDataUri("/img/missing.png", dir)).toBeNull();
    expect(avatarDataUri("/../og.png", dir)).toBeNull();
    expect(avatarDataUri(undefined, dir)).toBeNull();
  });
});

describe("fontsourceFile", () => {
  it("reads the WOFF fonts the image uses", () => {
    const font = fontsourceFile("space-grotesk", "space-grotesk-latin-700-normal.woff");
    expect(font.subarray(0, 4).toString("latin1")).toBe("wOFF");
  });
});
