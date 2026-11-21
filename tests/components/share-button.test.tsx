// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ShareButton } from "@/components/share/share-button";
import { ShareProvider } from "@/components/share/share-context";

function renderWithProvider(ui: React.ReactNode) {
  return render(<ShareProvider initials="AT">{ui}</ShareProvider>);
}

describe("ShareButton", () => {
  it("labels the page button and the link buttons", () => {
    renderWithProvider(
      <>
        <ShareButton kind="page" title="Ana" url="https://links.example.com" />
        <ShareButton kind="link" title="GitHub" url="https://github.com/ana" />
      </>,
    );
    expect(screen.getByRole("button", { name: "Compartilhar esta página" })).toHaveAttribute(
      "aria-haspopup",
      "dialog",
    );
    expect(screen.getByRole("button", { name: "Compartilhar link: GitHub" })).toBeInTheDocument();
  });

  it("opens the dialog for its own target", async () => {
    renderWithProvider(
      <>
        <ShareButton kind="page" title="Ana" url="https://links.example.com" />
        <ShareButton kind="link" title="GitHub" url="https://github.com/ana" />
      </>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Compartilhar link: GitHub" }));
    expect(screen.getByRole("heading", { name: "Compartilhar link" })).toBeInTheDocument();
    expect(screen.getByText("github.com/ana")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Fechar" }));
    expect(screen.getByRole("button", { name: "Compartilhar link: GitHub" })).toHaveFocus();

    await userEvent.click(screen.getByRole("button", { name: "Compartilhar esta página" }));
    expect(screen.getByRole("heading", { name: "Compartilhar página" })).toBeInTheDocument();
    expect(screen.getByText("links.example.com")).toBeInTheDocument();
  });

  it("needs a provider", () => {
    expect(() => render(<ShareButton kind="page" title="Ana" url="https://a.com" />)).toThrow(
      /ShareProvider/,
    );
  });
});
