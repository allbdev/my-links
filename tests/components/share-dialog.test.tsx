// @vitest-environment jsdom
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { COPIED_MS, ShareDialog } from "@/components/share/share-dialog";
import type { OpenShare } from "@/components/share/types";

const LINK: OpenShare = { kind: "link", title: "GitHub", url: "https://github.com/ana" };
const PAGE: OpenShare = { kind: "page", title: "Ana", url: "https://links.example.com" };

function setClipboard(writeText: ((text: string) => Promise<void>) | undefined) {
  Object.defineProperty(navigator, "clipboard", {
    value: writeText ? { writeText } : undefined,
    configurable: true,
  });
}

function setNativeShare(share: ((data: ShareData) => Promise<void>) | undefined) {
  Object.defineProperty(navigator, "share", { value: share, configurable: true });
}

function renderDialog(target: OpenShare | null, onClose = vi.fn()) {
  const utils = render(
    <>
      <button type="button">opener</button>
      <ShareDialog target={null} onClose={onClose} initials="AT" />
    </>,
  );
  screen.getByRole("button", { name: "opener" }).focus();
  utils.rerender(
    <>
      <button type="button">opener</button>
      <ShareDialog target={target} onClose={onClose} initials="AT" />
    </>,
  );
  return { ...utils, onClose };
}

const dialog = () => document.querySelector("dialog")!;

beforeEach(() => {
  setNativeShare(undefined);
  setClipboard(() => Promise.resolve());
});

afterEach(() => {
  vi.useRealTimers();
});

describe("ShareDialog", () => {
  it("stays closed and empty without a target", () => {
    render(<ShareDialog target={null} onClose={vi.fn()} initials="AT" />);
    expect(dialog()).not.toHaveAttribute("open");
    expect(dialog()).toBeEmptyDOMElement();
  });

  it("opens with a heading for a link and moves focus to the first action", () => {
    renderDialog(LINK);
    expect(dialog()).toHaveAttribute("open");
    expect(dialog()).toHaveAccessibleName("Compartilhar link");
    expect(screen.getByRole("button", { name: "Copiar link" })).toHaveFocus();
  });

  it("uses the page heading for the page", () => {
    renderDialog(PAGE);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Compartilhar página");
  });

  it("previews the title, the short URL and the initials", () => {
    renderDialog(LINK);
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.getByText("github.com/ana")).toBeInTheDocument();
    expect(screen.getByText("AT")).toHaveAttribute("aria-hidden", "true");
  });

  it("links to every share target, built from the title and URL", () => {
    renderDialog(LINK);
    const list = screen.getByRole("list", { name: "Opções de compartilhamento" });
    const href = (name: string) => within(list).getByRole("link", { name }).getAttribute("href");
    expect(href("WhatsApp")).toBe("https://wa.me/?text=GitHub%20https%3A%2F%2Fgithub.com%2Fana");
    expect(href("LinkedIn")).toBe(
      "https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fgithub.com%2Fana",
    );
    expect(href("X")).toBe(
      "https://x.com/intent/post?text=GitHub&url=https%3A%2F%2Fgithub.com%2Fana",
    );
    expect(href("E-mail")).toBe("mailto:?subject=GitHub&body=https%3A%2F%2Fgithub.com%2Fana");
    for (const name of ["WhatsApp", "LinkedIn", "X"]) {
      const link = within(list).getByRole("link", { name });
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("copies the URL and says so, then goes back after a moment", async () => {
    const writeText = vi.fn(() => Promise.resolve());
    setClipboard(writeText);
    renderDialog(LINK);
    vi.useFakeTimers();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copiar link" }));
    });
    expect(writeText).toHaveBeenCalledWith("https://github.com/ana");
    expect(screen.getByRole("button", { name: "Copiado!" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Copiado!");
    act(() => vi.advanceTimersByTime(COPIED_MS));
    expect(screen.getByRole("button", { name: "Copiar link" })).toBeInTheDocument();
  });

  it.each([
    ["the clipboard rejects", () => Promise.reject(new Error("denied"))],
    ["there is no clipboard", undefined],
  ])("shows the URL selected when %s", async (_label, writeText) => {
    setClipboard(writeText);
    renderDialog(LINK);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copiar link" }));
    });
    const field = screen.getByRole("textbox", { name: "Link para copiar" });
    expect(field).toHaveValue("https://github.com/ana");
    expect(field).toHaveAttribute("readonly");
    expect(screen.getByRole("status")).toHaveTextContent("Não deu para copiar");
  });

  it("hides 'Mais opções' without the native share sheet", () => {
    renderDialog(LINK);
    expect(screen.queryByRole("button", { name: "Mais opções" })).toBeNull();
  });

  it("opens the native share sheet when there is one, and ignores a cancel", async () => {
    const share = vi.fn(() => Promise.reject(new DOMException("cancel", "AbortError")));
    setNativeShare(share);
    renderDialog(LINK);
    await userEvent.click(screen.getByRole("button", { name: "Mais opções" }));
    expect(share).toHaveBeenCalledWith({ title: "GitHub", url: "https://github.com/ana" });
    expect(dialog()).toHaveAttribute("open");
  });

  it("closes from the close button and returns focus to the opener", async () => {
    const { onClose } = renderDialog(LINK);
    await userEvent.click(screen.getByRole("button", { name: "Fechar" }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "opener" })).toHaveFocus();
  });

  it("closes on a backdrop click but not on a click inside", () => {
    const { onClose } = renderDialog(LINK);
    fireEvent.click(screen.getByText("github.com/ana"));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(dialog());
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closes when the browser closes it (Esc)", () => {
    const { onClose } = renderDialog(LINK);
    act(() => dialog().close());
    expect(onClose).toHaveBeenCalledOnce();
  });
});
