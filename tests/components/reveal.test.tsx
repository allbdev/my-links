// @vitest-environment jsdom
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Reveal } from "@/components/reveal";

type Callback = (entries: { isIntersecting: boolean; target: Element }[]) => void;

class FakeObserver {
  static instances: FakeObserver[] = [];
  observed = new Set<Element>();
  constructor(readonly callback: Callback) {
    FakeObserver.instances.push(this);
  }
  observe(el: Element) {
    this.observed.add(el);
  }
  unobserve(el: Element) {
    this.observed.delete(el);
  }
  disconnect() {
    this.observed.clear();
  }
  /** Simulates these elements scrolling into view. */
  show(...els: Element[]) {
    act(() => this.callback(els.map((target) => ({ isIntersecting: true, target }))));
  }
}

/** A `.enter` element whose top is at `top` px (the viewport is 800 px tall). */
function enterAt(top: number, name: string): HTMLElement {
  const el = document.createElement("div");
  el.className = "enter";
  el.dataset.name = name;
  el.getBoundingClientRect = () => ({ top }) as DOMRect;
  document.body.append(el);
  return el;
}

function setReducedMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({ matches: reduce }) as typeof window.matchMedia;
}

beforeEach(() => {
  FakeObserver.instances = [];
  vi.stubGlobal("IntersectionObserver", FakeObserver);
  vi.stubGlobal("innerHeight", 800);
  setReducedMotion(false);
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

describe("Reveal", () => {
  it("holds back only the elements below the fold and leaves the rest alone", () => {
    const top = enterAt(100, "top");
    const edge = enterAt(790, "edge");
    const below = enterAt(900, "below");
    render(<Reveal />);
    expect(top.dataset.reveal).toBeUndefined();
    expect(edge.dataset.reveal).toBeUndefined();
    expect(below.dataset.reveal).toBe("waiting");
    expect([...FakeObserver.instances[0]!.observed]).toEqual([below]);
  });

  it("shows each element once as it scrolls in, staggered top to bottom", () => {
    const a = enterAt(900, "a");
    const b = enterAt(1000, "b");
    const c = enterAt(1100, "c");
    render(<Reveal />);
    const observer = FakeObserver.instances[0]!;
    observer.show(b, a);
    expect(a.dataset.reveal).toBe("shown");
    expect(b.dataset.reveal).toBe("shown");
    expect(a.style.getPropertyValue("--reveal-order")).toBe("0");
    expect(b.style.getPropertyValue("--reveal-order")).toBe("1");
    expect(c.dataset.reveal).toBe("waiting");
    expect([...observer.observed]).toEqual([c]);
  });

  it("does nothing with reduced motion", () => {
    setReducedMotion(true);
    const below = enterAt(900, "below");
    render(<Reveal />);
    expect(below.dataset.reveal).toBeUndefined();
    expect(FakeObserver.instances).toHaveLength(0);
  });

  it("does nothing without IntersectionObserver", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const below = enterAt(900, "below");
    render(<Reveal />);
    expect(below.dataset.reveal).toBeUndefined();
  });

  it("never leaves anything hidden when it unmounts", () => {
    const below = enterAt(900, "below");
    const { unmount } = render(<Reveal />);
    expect(below.dataset.reveal).toBe("waiting");
    unmount();
    expect(below.dataset.reveal).toBeUndefined();
  });

  it("renders nothing", () => {
    const { container } = render(<Reveal />);
    expect(container).toBeEmptyDOMElement();
  });
});
