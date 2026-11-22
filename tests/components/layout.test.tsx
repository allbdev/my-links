// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "@/components/footer";
import { TopBar } from "@/components/top-bar";

describe("TopBar", () => {
  it("shows the handle with a slash and its controls", () => {
    render(
      <TopBar handle="ana">
        <button type="button">Share</button>
      </TopBar>,
    );
    expect(screen.getByText("/ana")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Share" })).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });
});

describe("Footer", () => {
  it("links to the code in a new tab", () => {
    render(<Footer locale="pt" repoUrl="https://github.com/a/b" />);
    const link = screen.getByRole("link", { name: "ver o código (abre em nova aba)" });
    expect(link).toHaveAttribute("href", "https://github.com/a/b");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("drops the code link without a repo", () => {
    render(<Footer locale="pt" />);
    expect(screen.getByText("Feito com Next.js")).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
