"use client";

import { useDestination } from "../state/DestinationContext";
import { useEffect } from "react";

export default function DestinationModal() {
  const {
    activeDestination,
    setActiveDestination,
    destinations,
    toggleSelect,
    selected,
  } = useDestination();

  const closeModal = (restoreFocus = true) => {
    setActiveDestination(null);
    document.body.style.overflow = "";
    if (restoreFocus && activeDestination) {
      const sourceCard = document.querySelector(
        `.destination-card[data-id="${activeDestination.id}"]`
      );
      (sourceCard || document.getElementById("search-input"))?.focus();
    }
  };

  useEffect(() => {
    if (!activeDestination) return;
    document.body.style.overflow = "hidden";
    const closeBtn = document.getElementById("modal-close");
    closeBtn?.focus();

    const handleKeydown = (event) => {
      if (event.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [activeDestination]);

  if (!activeDestination) {
    return (
      <div className="modal-backdrop" id="modal-backdrop" hidden />
    );
  }

  const facts = [
    `About ${Math.round(activeDestination.duration / 15) * 15} min · estimate`,
    ...(activeDestination.interests || []).slice(0, 3),
    activeDestination.hiddenGem ? "Local find" : "Curated place",
  ];

  const isSelected = selected.includes(activeDestination.id);

  return (
    <>
      <div className="modal-backdrop" id="modal-backdrop" onClick={closeModal}>
        <section
          className="destination-modal"
          id="destination-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="modal-close"
            id="modal-close"
            aria-label="Close destination details"
            onClick={() => closeModal()}
          >
            ×
          </button>
          <div
            className="modal-image"
            id="modal-image"
            style={{
              backgroundImage: `url("${activeDestination.image}")`,
              backgroundPosition: activeDestination.imagePosition || "center",
            }}
            role="img"
            aria-label={`Illustrative photo for ${activeDestination.name}`}
          >
            <span className="illustrative-label modal-illustrative">
              ILLUSTRATIVE PHOTO
            </span>
          </div>
          <div className="modal-copy" id="modal-copy">
            <div className="modal-kicker" id="modal-kicker">
              {`${activeDestination.category} · ${activeDestination.area}`}
            </div>
            <h2 id="modal-title">{activeDestination.name}</h2>
            <p id="modal-description">{activeDestination.description}</p>
            <div className="modal-facts" id="modal-facts">
              {facts.map((fact) => (
                <span key={fact} className="modal-fact">
                  {fact}
                </span>
              ))}
            </div>
            <div className="detail-note">
              <span>ⓘ</span>
              <span>
                Opening hours and accessibility details are not verified in this pilot. Confirm with
                the attraction before travelling.
              </span>
            </div>
            <button
              className="primary-button"
              id="modal-add"
              onClick={() => {
                toggleSelect(activeDestination.id);
                closeModal(false);
                document.getElementById("generate-route")?.focus();
                document.getElementById("planner")?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }}
            >
              Add to my day <span>↗</span>
            </button>
          </div>
        </section>
      </div>
    </>
  );
}

