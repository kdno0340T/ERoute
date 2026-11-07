"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/gsap";
import { scrollTo } from "../lib/lenis";
import { useDestination } from "./state/DestinationContext";

/**
 * Header: persistent navigation shell.
 * Starts at opacity: 0 (no flash), fades in after preloader completes.
 * Nav links scroll with lenis.scrollTo instead of native anchor jumps.
 */
export default function Header() {
  const { selected, savedTrips, shareTrip } = useDestination();
  const scopeRef = useRef(null);
  const headerRef = useRef(null);

  useGSAP(
    () => {
      const ctx = gsap.context(() => {
        const header = headerRef.current;
        if (!header) return;

        // Initial state: hidden, no flash before preloader exits.
        gsap.set(header, { autoAlpha: 0 });

        // Fade in when preloader signals completion.
        const handlePreloaderComplete = () => {
          gsap.to(header, {
            autoAlpha: 1,
            duration: 0.8,
            ease: "power3.out",
          });
        };

        window.addEventListener("preloader:complete", handlePreloaderComplete);

        // If preloader already completed (e.g. reduced motion), fade in now.
        if (document.readyState === "complete") {
          handlePreloaderComplete();
        }

        return () => {
          window.removeEventListener(
            "preloader:complete",
            handlePreloaderComplete
          );
        };
      }, scopeRef);

      return () => ctx.revert();
    },
    [scopeRef]
  );

  const scrollToSection = (href) => {
    scrollTo(href, { duration: 0.9, offset: 80 });
  };

  return (
    <header ref={headerRef} className="site-header">
      <a className="brand" href="#top" aria-label="RoutER home">
        <span className="brand-mark" aria-hidden="true">
          <i></i>
          <i></i>
          <i></i>
        </span>
        <span className="brand-name">
          Rout<span>ER</span>
          <small>LOCAL TOURISM, THOUGHTFULLY PLANNED</small>
        </span>
      </a>
      <nav className="main-nav" aria-label="Main navigation">
        <a
          className="nav-link active"
          href="#discover"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("#discover");
          }}
        >
          Discover
        </a>
        <a
          className="nav-link"
          href="#map-section"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("#map-section");
          }}
        >
          Explore map
        </a>
        <a
          className="nav-link"
          href="#planner"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("#planner");
          }}
        >
          My itinerary <span className="nav-count" id="nav-count">
            {selected.length}
          </span>
        </a>
      </nav>
      <div className="header-actions">
        <button
          className="icon-button saved-open"
          id="saved-open"
          aria-label="Open saved trips"
          title="Saved trips"
          onClick={() => {
            const drawer = document.getElementById("saved-drawer");
            const shade = document.getElementById("drawer-shade");
            drawer?.setAttribute("inert", "false");
            drawer?.classList.add("open");
            drawer?.setAttribute("aria-hidden", "false");
            shade?.setAttribute("hidden", null);
            document.body.classList.add("drawer-open");
            document.getElementById("saved-close")?.focus();
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-3.8L6 21V4.75Z" />
          </svg>
          <span
            className="saved-dot"
            id="saved-dot"
            hidden={savedTrips.length === 0}
          ></span>
        </button>
        <button className="avatar-button" id="share-top" aria-label="Share this trip" onClick={shareTrip}>
          ↗
        </button>
      </div>
    </header>
  );
}



