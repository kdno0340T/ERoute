"use client";

import { useEffect, useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "../../lib/gsap";

/**
 * SectionCounter: shows current section number and total.
 * Total is derived from the real sections on the page.
 * Current updates via ScrollTrigger as each section enters the viewport.
 */
export default function SectionCounter() {
  const scopeRef = useRef(null);
  const [current, setCurrent] = useState(1);
  const [total, setTotal] = useState(0);

  useGSAP(
    () => {
      const ctx = gsap.context(() => {
        // Derive total from the real content sections on the page.
        const sectionSelectors = [
          ".hero",
          ".intro-strip",
          ".story-reel",
          ".discover-section",
          ".seasonal-band",
          ".map-section",
        ];
        const sections = gsap.utils.toArray(sectionSelectors);
        if (sections.length) setTotal(sections.length);

        sections.forEach((section, index) => {
          ScrollTrigger.create({
            trigger: section,
            start: "top 25%",
            onEnter: () => setCurrent(index + 1),
            onEnterBack: () => setCurrent(index + 1),
          });
        });
      }, scopeRef);

      return () => ctx.revert();
    },
    [scopeRef]
  );

  return (
    <div className="section-counter" id="section-counter" aria-hidden="true">
      <span className="section-counter-current" id="section-counter-current">
        {String(current).padStart(2, "0")}
      </span>
      <span className="section-counter-sep">/</span>
      <span className="section-counter-total" id="section-counter-total">
        {String(total).padStart(2, "0")}
      </span>
    </div>
  );
}

