// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FeaturedCard } from "@/components/featured-card";
import { SectionHeading } from "@/components/section-heading";
import type { FeaturedBlock } from "@/lib/schema";

const BLOCK: FeaturedBlock = {
  type: "featured",
  title: "Path Trader",
  subtitle: "SaaS para traders",
  url: "https://www.path-trader.com.br/",
  image: "/thumbs/path-trader.svg",
  badge: "No ar",
};

describe("FeaturedCard", () => {
  it("is one link named by its title, badge and subtitle", () => {
    render(<FeaturedCard block={BLOCK} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAccessibleName("Path Trader SaaS para traders No ar (abre em nova aba)");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("shows a decorative image with fixed dimensions", () => {
    const { container } = render(<FeaturedCard block={BLOCK} />);
    const img = container.querySelector("img")!;
    expect(img).toHaveAttribute("alt", "");
    expect(img).toHaveAttribute("src", "/thumbs/path-trader.svg");
    expect(img).toHaveAttribute("width", "800");
    expect(img).toHaveAttribute("height", "400");
  });

  it("shows the badge and subtitle only when present", () => {
    const { rerender } = render(<FeaturedCard block={BLOCK} />);
    expect(screen.getByText("No ar")).toBeInTheDocument();
    rerender(<FeaturedCard block={{ ...BLOCK, badge: undefined, subtitle: undefined }} />);
    expect(screen.queryByText("No ar")).toBeNull();
    expect(screen.queryByText("SaaS para traders")).toBeNull();
  });

  it("puts the share control outside the link", () => {
    render(<FeaturedCard block={BLOCK} share={<button type="button">Share</button>} />);
    expect(screen.getByRole("button", { name: "Share" }).closest("a")).toBeNull();
  });
});

describe("SectionHeading", () => {
  it("is an h2 with an id", () => {
    render(<SectionHeading id="s-1" title="Projetos" />);
    const heading = screen.getByRole("heading", { level: 2, name: "Projetos" });
    expect(heading).toHaveAttribute("id", "s-1");
  });
});
