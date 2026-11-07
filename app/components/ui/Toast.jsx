"use client";

import { useDestination } from "../state/DestinationContext";

export default function Toast() {
  const { toastMessage, announceMessage } = useDestination();
  return (
    <>
      <div
        className={`toast ${toastMessage ? "visible" : ""}`}
        id="toast"
        role="status"
        aria-live="polite"
      >
        {toastMessage}
      </div>
      <div id="live-region" className="sr-only" aria-live="polite">
        {announceMessage}
      </div>
    </>
  );
}

