// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { isValidElement, type ReactElement, type ReactNode } from "react";

vi.mock("@vercel/analytics/next", () => ({ Analytics: () => null }));
// next/font only works inside the Next compiler.
vi.mock("@/app/fonts", () => ({ FONT_VARIABLES: "" }));

const { Analytics } = await import("@vercel/analytics/next");
const { LocaleLayout } = await import("@/app/_shared/locale-layout");

function contains(node: ReactNode, type: unknown): boolean {
  if (Array.isArray(node)) return node.some((child: ReactNode) => contains(child, type));
  if (!isValidElement(node)) return false;
  const element = node as ReactElement<{ children?: ReactNode }>;
  return element.type === type || contains(element.props.children, type);
}

describe("Vercel Web Analytics", () => {
  it.each(["en", "pt"] as const)("is mounted in the %s layout", (locale) => {
    const tree = LocaleLayout({ locale, children: <main /> });
    expect(contains(tree, Analytics)).toBe(true);
  });
});
