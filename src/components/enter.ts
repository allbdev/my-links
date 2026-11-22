import type { CSSProperties } from "react";

/** The class of every element in the page entrance (globals.css, reveal.tsx). */
export const ENTER_CLASS = "enter";

/**
 * Props for an element that takes part in the page entrance (the `.enter`
 * animation in globals.css): `index` is its place in the stagger.
 */
export function enter(index: number): { className: string; style: CSSProperties } {
  return { className: ENTER_CLASS, style: { "--enter-index": index } as CSSProperties };
}

/** Joins class names, skipping empty ones. */
export function cx(...names: (string | false | undefined)[]): string {
  return names.filter(Boolean).join(" ");
}
