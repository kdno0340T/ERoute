"use client";

import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

/**
 * Lenis smooth scroll + ScrollTrigger integration.
 *
 * Per gsap-scrolltrigger skill: ScrollTrigger must use scrollerProxy when a
 * custom smooth-scroll library (Lenis) controls the scroll position. Lenis'
 * raf callback calls ScrollTrigger.update() so scroll-linked animations stay
 * in sync with the smoothed scroll position.
 *
 * Lenis v1.x uses `lerp` (not `duration`/`easing`) and requires its raf to be
 * driven every frame — we use gsap.ticker for that.
 *
 * Client-side only — Lenis and ScrollTrigger never run during SSR.
 */

// Initialize Lenis imperatively. Returns a cleanup function.
// Intended to be called from a component's useEffect/useLayoutEffect.
export function initLenis({ container = document.documentElement } = {}) {
  if (typeof window === "undefined") return () => {};

  const lenis = new Lenis({
    lerp: 0.1, // smoothness factor (0.1 = smooth, 1 = instant)
    direction: "vertical",
    gestureDirection: "vertical",
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });

  // Drive Lenis raf every frame via GSAP ticker (per Lenis v1.x docs).
  const onTick = (time) => {
    lenis.raf(time * 1000);
  };
  gsap.ticker.add(onTick);

  // ScrollTrigger scrollerProxy — tells ScrollTrigger to read Lenis'
  // animated scroll position instead of native scrollTop.
  ScrollTrigger.scrollerProxy(container, {
    scrollTop: (value) => {
      if (arguments.length) {
        lenis.scrollTo(value, { duration: 0, force: true });
        return;
      }
      return lenis.scroll;
    },
    scrollLeft: (value) => {
      if (arguments.length) {
        lenis.scrollTo(value, { duration: 0, force: true, dir: "horizontal" });
        return;
      }
      return 0;
    },
    getBoundingClientRect: () => ({
      top: 0,
      left: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    }),
    pinType: container === document.documentElement ? "transform" : "transform",
  });

  // Sync Lenis scroll events with ScrollTrigger on every frame.
  lenis.on("scroll", () => {
    ScrollTrigger.update();
  });

  ScrollTrigger.refresh();

  return () => {
    gsap.ticker.remove(onTick);
    lenis.destroy();
    ScrollTrigger.getAll().forEach((t) => t.kill());
    ScrollTrigger.clearScrollMemory(container);
    ScrollTrigger.refresh();
  };
}

/**
 * React hook for Lenis. Returns a ref that holds the Lenis instance.
 */
export function useLenis() {
  const lenisRef = useRef(null);
  return lenisRef;
}