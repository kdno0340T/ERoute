"use client";

import { useEffect, useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "../../lib/gsap";
import { getLenis } from "../../lib/lenis";

/**
 * Preloader: full-screen overlay with a counter 0→100.
 * Tied to real readiness (document.fonts.ready + window load),
 * minimum 1.2s, hard timeout 4s. Locks scroll while playing,
 * exits with a GSAP timeline, then restarts Lenis and refreshes ScrollTrigger.
 * Skipped entirely under prefers-reduced-motion.
 */
export default function Preloader() {
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const scopeRef = useRef(null);

  useGSAP(
    () => {
      const ctx = gsap.context(() => {
        if (!isReady) return;

        const lenis = getLenis();
        const tl = gsap.timeline({
          onComplete: () => {
            if (lenis) lenis.start();
            ScrollTrigger.refresh();
            document.documentElement.style.overflow = "";
            const el = document.getElementById("preloader");
            if (el) el.remove();
          },
        });

        tl.to("#preloader-count", {
          opacity: 0,
          duration: 0.4,
          ease: "power3.out",
        });
        tl.to(
          "#preloader",
          {
            opacity: 0,
            duration: 0.6,
            ease: "power3.out",
            onComplete: () => {
              const el = document.getElementById("preloader");
              if (el) el.remove();
              window.dispatchEvent(new CustomEvent("preloader:complete"));
            },
          },
          "<0.2"
        );
      }, scopeRef);

      return () => ctx.revert();
    },
    [scopeRef, isReady]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setIsReady(true);
      return;
    }

    const lenis = getLenis();
    if (lenis) lenis.stop();
    document.documentElement.style.overflow = "hidden";

    let startTime = Date.now();
    let resolved = false;
    let rafId;

    const tick = () => {
      if (resolved) return;
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / 1200) * 100));
      setProgress(pct);
      rafId = requestAnimationFrame(tick);
    };

    const finish = () => {
      if (resolved) return;
      resolved = true;
      setProgress(100);
      setIsReady(true);
    };

    Promise.all([
      document.fonts.ready,
      new Promise((resolve) =>
        window.addEventListener("load", resolve, { once: true })
      ),
    ]).then(() => {
      const elapsed = Date.now() - startTime;
      setTimeout(finish, Math.max(0, 1200 - elapsed));
    });

    const hardTimeout = setTimeout(finish, 4000);
    tick();

    return () => {
      resolved = true;
      cancelAnimationFrame(rafId);
      clearTimeout(hardTimeout);
      if (lenis) lenis.start();
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (isReady) return null;

  return (
    <div id="preloader">
      <div id="preloader-inner">
        <span id="preloader-count">{progress}</span>
        <span id="preloader-pct">%</span>
      </div>
    </div>
  );
}
