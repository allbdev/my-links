"use client";

import { useEffect } from "react";
import { ENTER_CLASS } from "./enter";

/** How far into the viewport an element has to come before it rises in. */
const ROOT_MARGIN = "0px 0px -12% 0px";

/**
 * Makes the page entrance follow the scroll: elements that start below the
 * fold wait (off screen, so nothing visible changes) and rise in as they
 * scroll into view, once. Elements already on screen keep the load entrance.
 * Without JS, or with reduced motion, it does nothing and the CSS entrance
 * plays for everything. Renders nothing.
 */
export function Reveal() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const below = [...document.querySelectorAll<HTMLElement>(`.${ENTER_CLASS}`)].filter(
      (el) => el.getBoundingClientRect().top >= window.innerHeight,
    );
    if (below.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target as HTMLElement)
          .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
          .forEach((el, order) => {
            el.style.setProperty("--reveal-order", String(order));
            el.dataset.reveal = "shown";
            observer.unobserve(el);
          });
      },
      { rootMargin: ROOT_MARGIN },
    );

    for (const el of below) {
      el.dataset.reveal = "waiting";
      observer.observe(el);
    }
    return () => {
      observer.disconnect();
      // Never leave anything hidden if this unmounts.
      for (const el of below) {
        if (el.dataset.reveal === "waiting") delete el.dataset.reveal;
      }
    };
  }, []);

  return null;
}
