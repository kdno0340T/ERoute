"use client";

import { useLayoutEffect, useRef } from "react";
import { mountSiteMotion } from "./motion/siteMotion";
import { mountHeroMotion } from "./motion/heroMotion";
import { mountIntroMotion } from "./motion/introMotion";
import { initLenis } from "./motion/lenis";

export default function LegacyApp({ markup }) {
  const rootRef = useRef(null);
  const preloaderRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Initialize Lenis smooth scroll + ScrollTrigger scrollerProxy.
    const unmountLenis = initLenis();

    const unmountMotion = mountSiteMotion(root);
    const unmountHeroMotion = mountHeroMotion(root, preloaderRef.current);
    const unmountIntroMotion = mountIntroMotion(root);
    let script;
    const existing = document.querySelector('script[data-router-runtime="true"]');
    if (!existing) {
      script = document.createElement("script");
      script.src = "/app.js";
      script.dataset.routerRuntime = "true";
      script.async = true;
      document.body.appendChild(script);
    }
    return () => {
      if (script) script.remove();
      unmountHeroMotion();
      unmountIntroMotion();
      unmountMotion();
      unmountLenis();
    };
  }, []);

  return (
    <>
      <div id="legacy-app" ref={rootRef} dangerouslySetInnerHTML={{ __html: markup }} />
      <div
        ref={preloaderRef}
        className="hero-intro-preloader"
        role="status"
        aria-live="polite"
        style={{
          position: "fixed", inset: 0, zIndex: 1000, display: "grid", placeItems: "center",
          background: "var(--peach)", color: "var(--ink)", fontFamily: "var(--display)",
          fontSize: "clamp(28px, 5vw, 64px)", fontWeight: 800, letterSpacing: "-.06em",
        }}
      >
        <span>0%</span>
      </div>
    </>
  );
}
