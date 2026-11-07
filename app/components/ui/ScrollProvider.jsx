"use client";

import { useEffect } from "react";
import { initLenis } from "../../lib/lenis";
import { ScrollTrigger } from "../../lib/gsap";

/**
 * ScrollProvider mounts Lenis smooth scroll once for the whole page,
 * syncs it with ScrollTrigger via gsap.ticker, and cleans up on unmount.
 * Under prefers-reduced-motion, smooth scrolling is disabled and native
 * scroll is used instead.
 */
export default function ScrollProvider({ children }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cleanup;

    if (!reduced) {
      cleanup = initLenis();
    } else {
      // Under reduced motion: native scroll, just refresh ScrollTrigger.
      ScrollTrigger.refresh();
    }

    return () => {
      cleanup?.();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      ScrollTrigger.refresh();
    };
  }, []);

  return <>{children}</>;
}
