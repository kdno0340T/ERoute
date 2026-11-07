"use client";

import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let lenisInstance: Lenis | null = null;

/**
 * Lenis provider: initializes Lenis smooth scroll, syncs via gsap.ticker,
 * and drives ScrollTrigger through lenis.on("scroll", ScrollTrigger.update).
 * No scrollerProxy. Returns a cleanup function.
 */
export function initLenis({
  container = document.documentElement,
}: { container?: Element | Document } = {}) {
  if (typeof window === "undefined") return () => {};

  const lenis = new Lenis({
    lerp: 0.1,
    orientation: "vertical",
    gestureOrientation: "vertical",
    smoothWheel: true,
    touchMultiplier: 2,
    infinite: false,
  });

  lenisInstance = lenis;

  // Drive Lenis raf every frame via GSAP ticker.
  const onTick = (time: number) => {
    lenis.raf(time * 1000);
  };
  gsap.ticker.add(onTick);

  // Sync Lenis scroll events with ScrollTrigger on every frame (no scrollerProxy).
  lenis.on("scroll", () => {
    ScrollTrigger.update();
  });

  ScrollTrigger.refresh();

  return () => {
    gsap.ticker.remove(onTick);
    lenis.destroy();
    ScrollTrigger.getAll().forEach((t) => t.kill());
    ScrollTrigger.refresh();
    lenisInstance = null;
  };
}

export function getLenis() {
  return lenisInstance;
}

/**
 * Scroll to a target using lenis.scrollTo (replaces ScrollToPlugin).
 * Accepts a CSS selector string or a numeric scroll position.
 */
export function scrollTo(
  target: string | number,
  options: { duration?: number; offset?: number } = {}
) {
  if (!lenisInstance) return;
  const duration = options.duration ?? 0.9;
  const offset = options.offset ?? 0;

  if (typeof target === "string") {
    const el = document.querySelector(target);
    if (el) {
      lenisInstance.scrollTo(el, { duration, offset });
    }
  } else {
    lenisInstance.scrollTo(target, { duration });
  }
}
