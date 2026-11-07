"use client";

import { useEffect } from "react";

export default function FooterSection() {
  useEffect(() => {
    const el = document.getElementById("current-year");
    if (el) el.textContent = String(new Date().getFullYear());
  }, []);

  return (
    <footer className="site-footer content-width">
      <div className="footer-top">
        <a className="brand footer-brand" href="#top">
          <span className="brand-mark" aria-hidden="true">
            <i></i>
            <i></i>
            <i></i>
          </span>
          <span className="brand-name">
            Rout<span>ER</span>
            <small>SMART LOCAL TOURISM PLANNER</small>
          </span>
        </a>
        <p>Find a little more<br />in every place.</p>
        <a className="footer-top-link" href="#top">
          BACK TO TOP ↑
        </a>
      </div>
      <div className="footer-bottom">
        <span>AN EARLY PILOT FOR MANGALURU, KARNATAKA</span>
        <span>
          PHOTOS ARE ILLUSTRATIVE. PLACE DETAILS AND ACCESS CAN CHANGE; PLEASE VERIFY BEFORE YOU GO.
        </span>
        <span>
          © ROUTER <span id="current-year"></span>
        </span>
      </div>
    </footer>
  );
}
