// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LanguageSwitch } from "@/components/language-switch";

describe("LanguageSwitch", () => {
  it("is a navigation landmark named in the page's language", () => {
    const { unmount } = render(<LanguageSwitch locale="en" />);
    expect(screen.getByRole("navigation", { name: "Language" })).toBeInTheDocument();
    unmount();
    render(<LanguageSwitch locale="pt" />);
    expect(screen.getByRole("navigation", { name: "Idioma" })).toBeInTheDocument();
  });

  it("links to every language version, each labelled in its own language", () => {
    render(<LanguageSwitch locale="en" />);
    const en = screen.getByRole("link", { name: "EN (English)" });
    const pt = screen.getByRole("link", { name: "PT (Português)" });
    expect(en).toHaveAttribute("href", "/");
    expect(en).toHaveAttribute("hreflang", "en");
    expect(en).toHaveAttribute("lang", "en");
    expect(pt).toHaveAttribute("href", "/pt/");
    expect(pt).toHaveAttribute("hreflang", "pt-BR");
    expect(pt).toHaveAttribute("lang", "pt-BR");
  });

  it("marks the current language and opens nothing in a new tab", () => {
    render(<LanguageSwitch locale="pt" />);
    expect(screen.getByRole("link", { name: "PT (Português)" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "EN (English)" })).not.toHaveAttribute("aria-current");
    for (const link of screen.getAllByRole("link")) expect(link).not.toHaveAttribute("target");
  });
});
