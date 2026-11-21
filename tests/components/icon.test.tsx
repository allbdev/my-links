// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ICONS, Icon, SOCIAL_ICONS } from "@/components/icons/icon";
import { ICON_NAMES, SOCIAL_TYPES } from "@/lib/schema";

describe("icons", () => {
  it("has a component for every icon name and social type in the schema", () => {
    expect(Object.keys(ICONS).sort()).toEqual([...ICON_NAMES].sort());
    expect(Object.keys(SOCIAL_ICONS).sort()).toEqual([...SOCIAL_TYPES].sort());
  });

  it.each(ICON_NAMES)("renders %s as a hidden, unfocusable svg", (name) => {
    const { container } = render(<Icon name={name} size={24} />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("width", "24");
  });
});
