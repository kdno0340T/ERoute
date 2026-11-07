"use client";

import { useDestination } from "../state/DestinationContext";

export default function HeroSection() {
  const { setSearch } = useDestination();
  return (
    <section className="hero content-width" aria-labelledby="hero-title">
      <div className="hero-copy">
        <div className="eyebrow">
          <span className="eyebrow-line"></span>
          YOUR COASTAL COMPASS
          <span className="eyebrow-place">12°52′ N · 74°50′ E</span>
        </div>
        <h1 id="hero-title">
          Find your<br />
          kind of <em>coast.</em>
        </h1>
        <p className="hero-intro">
          The familiar shore, the quiet lane, the plate you’ll remember. Find the places that make
          Mangaluru yours.
        </p>
        <div className="hero-search" role="search">
          <label
            className="search-icon"
            htmlFor="search-input"
            aria-label="Search destinations"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10.8" cy="10.8" r="6.3" />
              <path d="m15.5 15.5 4.2 4.2" />
            </svg>
          </label>
          <input
            id="search-input"
            type="search"
            placeholder='Try “quiet beach” or “temple”'
            autoComplete="off"
            onInput={(event) => setSearch(event.target.value)}
          />
          <button
            className="search-submit"
            id="search-submit"
            onClick={() => {
              const input = document.getElementById("search-input");
              if (input) setSearch(input.value);
              document.getElementById("discover")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          >
            Explore <span aria-hidden="true">↗</span>
          </button>
        </div>
        <div className="hero-meta">
          <span>
            <i className="status-dot"></i> THE MALNAD &amp; COASTAL PILOT
          </span>
          <span>CURATED FOR THE CURIOUS</span>
        </div>
      </div>
      <div className="hero-visual">
        <div className="hero-photo" role="img" aria-label="Waves rolling onto a warm, sandy coast" />
        <div className="hero-photo-shade" />
        <div className="hero-stamp">
          <span>COASTAL<br />FIND NO. 01</span>
          <strong>12</strong>
          <small>PLACES TO BEGIN</small>
        </div>
        <div className="hero-caption">
          <span>01 / 04</span>
          <span>COASTAL MOOD · ILLUSTRATIVE IMAGE</span>
        </div>
        <span className="hero-side-note">KARNATAKA · INDIA</span>
      </div>
      <div className="hero-bottom-note">
        <span>SCROLL TO FIND YOUR WAY</span>
        <span className="down-mark">↓</span>
      </div>
    </section>
  );
}

