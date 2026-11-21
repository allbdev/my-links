// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LinkCard } from "@/components/link-card";
import type { LinkBlock } from "@/lib/schema";

const base: LinkBlock = { type: "link", title: "GitHub", url: "https://github.com/ana" };

describe("LinkCard", () => {
  it("is one link to the URL, opening external sites in a new tab", () => {
    render(<LinkCard block={base} />);
    const link = screen.getByRole("link", { name: "GitHub (abre em nova aba)" });
    expect(link).toHaveAttribute("href", "https://github.com/ana");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it.each(["mailto:ana@example.com", "/cv.pdf"])("opens %s in the same tab", (url) => {
    render(<LinkCard block={{ ...base, title: "Doc", url }} />);
    const link = screen.getByRole("link", { name: "Doc" });
    expect(link).toHaveAttribute("href", url);
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
  });

  it("shows an icon tile, hidden from screen readers", () => {
    const { container } = render(<LinkCard block={{ ...base, icon: "github" }} />);
    expect(container.querySelector(".tile")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector(".tile svg")).not.toBeNull();
    expect(container.querySelector(".plain")).toBeNull();
  });

  it("shows a decorative thumbnail with a fixed size", () => {
    const { container } = render(<LinkCard block={{ ...base, image: "/thumbs/a.webp" }} />);
    const img = container.querySelector("img")!;
    expect(img).toHaveAttribute("alt", "");
    expect(img).toHaveAttribute("width", "48");
    expect(img).toHaveAttribute("height", "48");
  });

  it("centres the title when there's no icon or image", () => {
    const { container } = render(<LinkCard block={base} />);
    expect(container.querySelector("a")).toHaveClass("plain");
  });

  it("marks highlighted cards", () => {
    const { container } = render(<LinkCard block={{ ...base, highlight: true }} />);
    expect(container.firstChild).toHaveClass("highlight");
  });

  it("puts the share control next to the link, not inside it", () => {
    render(<LinkCard block={base} share={<button type="button">Share GitHub</button>} />);
    const button = screen.getByRole("button", { name: "Share GitHub" });
    expect(button.closest("a")).toBeNull();
  });
});
