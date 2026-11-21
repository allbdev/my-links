// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StaticImage } from "@/components/static-image";

describe("StaticImage", () => {
  it("lazy-loads with fixed dimensions by default", () => {
    const { container } = render(<StaticImage src="/a.webp" alt="A" width={48} height={24} />);
    const img = container.querySelector("img")!;
    expect(img).toHaveAttribute("src", "/a.webp");
    expect(img).toHaveAttribute("width", "48");
    expect(img).toHaveAttribute("height", "24");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).not.toHaveAttribute("fetchpriority");
  });

  it("loads priority images eagerly with high fetch priority", () => {
    const { container } = render(
      <StaticImage src="/a.webp" alt="" width={1} height={1} priority />,
    );
    const img = container.querySelector("img")!;
    expect(img).toHaveAttribute("loading", "eager");
    expect(img).toHaveAttribute("fetchpriority", "high");
  });
});
