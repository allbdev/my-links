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
  const AUTHOR = { name: "allbdev", url: "https://github.com/allbdev" };

  it("credits the author and links to the code, both in a new tab", () => {
    render(<Footer locale="en" author={AUTHOR} repoUrl="https://github.com/a/b" />);
    expect(screen.getByRole("contentinfo")).toHaveTextContent(
      /^Built by allbdev\s*\(opens in a new tab\)\s*· see the code/,
    );
    const author = screen.getByRole("link", { name: "allbdev (opens in a new tab)" });
    expect(author).toHaveAttribute("href", "https://github.com/allbdev");
    const code = screen.getByRole("link", { name: "see the code (opens in a new tab)" });
    expect(code).toHaveAttribute("href", "https://github.com/a/b");
    for (const link of [author, code]) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("says it in Portuguese on /pt/", () => {
    render(<Footer locale="pt" author={AUTHOR} />);
    expect(screen.getByRole("contentinfo")).toHaveTextContent(/^Feito por allbdev/);
    expect(screen.getByRole("link", { name: "allbdev (abre em nova aba)" })).toBeInTheDocument();
  });

  it("shows only the code link without an author", () => {
    render(<Footer locale="pt" repoUrl="https://github.com/a/b" />);
    expect(screen.queryByText(/Feito por/)).toBeNull();
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByRole("contentinfo")).not.toHaveTextContent("·");
  });

  it("renders nothing with neither", () => {
    const { container } = render(<Footer locale="pt" />);
    expect(container).toBeEmptyDOMElement();
  });
});
