import { describe, expect, it } from "vitest";
import { assetsOf } from "../../tools/size-check";

describe("size check", () => {
  it("finds scripts and stylesheets, skipping noModule polyfills", () => {
    const html = `
      <link rel="stylesheet" href="/_next/static/a.css" data-precedence="next"/>
      <script src="/_next/static/one.js" async=""></script>
      <script src="/_next/static/polyfill.js" noModule=""></script>
      <script src="/_next/static/one.js" async=""></script>
      <script>self.__next_f.push([1])</script>`;
    expect(assetsOf(html)).toEqual({
      js: ["/_next/static/one.js"],
      css: ["/_next/static/a.css"],
    });
  });
});
