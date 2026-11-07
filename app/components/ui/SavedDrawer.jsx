"use client";

import { useDestination } from "../state/DestinationContext";
import { useEffect } from "react";

export default function SavedDrawer() {
  const {
    savedTrips,
    setSavedTrips,
    selected,
    isGenerated,
    saveTrip,
    loadTrip,
    destinations,
    copyTripUrl,
    toast,
  } = useDestination();

  useEffect(() => {
    if (!savedTrips.length) return;
    document.getElementById("saved-dot")?.setAttribute("hidden", null);
  }, [savedTrips]);

  const openSavedDrawer = () => {
    const drawer = document.getElementById("saved-drawer");
    const shade = document.getElementById("drawer-shade");
    drawer?.setAttribute("inert", "false");
    drawer?.classList.add("open");
    drawer?.setAttribute("aria-hidden", "false");
    shade?.setAttribute("hidden", null);
    document.body.classList.add("drawer-open");
    document.getElementById("saved-close")?.focus();
  };

  const closeSavedDrawer = () => {
    const drawer = document.getElementById("saved-drawer");
    const shade = document.getElementById("drawer-shade");
    drawer?.classList.remove("open");
    drawer?.setAttribute("aria-hidden", "true");
    drawer?.setAttribute("inert", "true");
    shade?.setAttribute("hidden", "");
    document.body.classList.remove("drawer-open");
    document.getElementById("saved-open")?.focus();
  };

  const handleDrawerClick = (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const card = button.closest(".saved-trip");
    const tripId = card?.dataset.tripId;
    const trip = savedTrips.find((item) => item.id === tripId);
    if (!trip) return;
    if (button.dataset.action === "delete-trip") {
      const next = savedTrips.filter((item) => item.id !== trip.id);
      setSavedTrips(next);
      localStorage.setItem("router-saved-trips", JSON.stringify(next));
      // Re-render is handled by context provider via setSavedTrips
    } else if (button.dataset.action === "load-trip") {
      loadTrip(trip);
      closeSavedDrawer();
      document.getElementById("planner")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    } else if (button.dataset.action === "share-saved") {
      copyTripUrl(trip).then(() => toast("A shareable itinerary link is copied."));
    }
  };

  const renderTripDate = (date) => {
    if (!date) return "Date not set";
    return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <aside
        className={`saved-drawer ${savedTrips.length ? "" : ""}`}
        id="saved-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="saved-title"
        aria-hidden="true"
        inert
      >
        <div className="saved-drawer-head">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line"></span> YOUR TRAVEL NOTES
            </div>
            <h2 id="saved-title">Saved <em>days.</em></h2>
          </div>
          <button
            className="modal-close"
            id="saved-close"
            aria-label="Close saved trips"
            onClick={closeSavedDrawer}
          >
            ×
          </button>
        </div>
        <div className="saved-list" id="saved-list" onClick={handleDrawerClick}>
          {savedTrips.length === 0 ? (
            <div className="saved-empty">
              No saved days yet. Build an itinerary and save it here for this device.
            </div>
          ) : (
            savedTrips.map((trip) => {
              const count = (trip.stops || []).length;
              const date = renderTripDate(trip.date);
              return (
                <article
                  key={trip.id}
                  className="saved-trip"
                  data-trip-id={trip.id}
                >
                  <h3>{trip.title || `${count} stops near Mangaluru`}</h3>
                  <p>
                    {`${date} · ${count} stops · ${MODE_NAMES[trip.mode] || "Travel mode not set"}`}
                  </p>
                  <div className="saved-trip-actions">
                    <button data-action="load-trip">Open this day</button>
                    <button data-action="share-saved">Share</button>
                    <button data-action="delete-trip">Remove</button>
                  </div>
                </article>
              );
            })
          )}
        </div>
        <div className="saved-drawer-foot">
          Trips are saved on this device. Share a link to take a plan with you.
        </div>
      </aside>
      <div className="drawer-shade" id="drawer-shade" hidden onClick={closeSavedDrawer} />
    </>
  );
}

const MODE_NAMES = { car: "Car / taxi", scooter: "Scooter", transit: "Public transport", walk: "On foot" };
