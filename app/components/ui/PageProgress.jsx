"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "../../lib/gsap";

/**
 * PageProgress: thin top bar driven by scroll progress via ScrollTrigger.
 * Animates scaleX only (transform property).
 */
export default function PageProgress() {
  const scopeRef = useRef(null);

  useGSAP(
    () => {
      const ctx = gsap.context(() => {
        const bar = document.querySelector("#page-progress > span");
        if (!bar) return;

        gsap.set(bar, { scaleX: 0, transformOrigin: "left center" });

        gsap.to(bar, {
          scaleX: 1,
          ease: "none",
          duration: 0.5,
          scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
          },
        });
      }, scopeRef);

      return () => ctx.revert();
    },
    [scopeRef]
  );

  return (
    <div className="page-progress" id="page-progress" aria-hidden="true">
      <span></span>
    </div>
  );
}

