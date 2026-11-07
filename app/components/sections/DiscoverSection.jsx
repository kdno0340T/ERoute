"use client";

import { useDestination } from "../state/DestinationContext";

export default function DiscoverSection() {
  const {
    destinations,
    category,
    search,
    sort,
    visibleLimit,
    selected,
    loading,
    error,
    filteredDestinations,
    setCategory,
    setSearch,
    setSort,
    setVisibleLimit,
    toggleSelect,
    toggleFavorite,
    setActiveDestination,
    favorites,
    shareTrip,
  } = useDestination();

  const filtered = filteredDestinations();

  const isFavorite = (id) => favorites.has(id);

  const handleClearFilters = () => {
    setSearch("");
    setCategory("All");
    const input = document.getElementById("search-input");
    if (input) input.value = "";
  };

  return (
    <section
      className="discover-section content-width"
      id="discover"
      aria-labelledby="discover-title"
    >
      <div className="section-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line"></span> MANGALURU &amp; AROUND
          </div>
          <h2 id="discover-title">
            The coast is <em>calling.</em>
          </h2>
        </div>
        <div className="section-heading-side">
          <span className="section-index">01 — 03</span>
          <p>Big names, local favourites, and a few places you may have missed.</p>
        </div>
      </div>

      <div className="discovery-layout">
        <div className="discovery-main">{renderDiscoveryMain()}</div>
        <aside className="planner-card" id="planner" aria-labelledby="planner-title">
          {renderPlannerCard()}
        </aside>
      </div>
    </section>
  );
  function renderDiscoveryMain() {
    return (
      <>
        <div className="discovery-toolbar">
          <div
            className="filter-tabs"
            id="filter-tabs"
            role="group"
            aria-label="Filter destinations"
          >
            <button
              className={`filter-tab ${category === "All" ? "selected" : ""}`}
              data-category="All"
              aria-pressed={category === "All"}
              onClick={() => setCategory("All")}
            >
              All places <span id="all-count">{destinations.length}</span>
            </button>
            <button
              className={`filter-tab ${category === "Beach" ? "selected" : ""}`}
              data-category="Beach"
              aria-pressed={category === "Beach"}
              onClick={() => setCategory("Beach")}
            >
              Coast
            </button>
            <button
              className={`filter-tab ${category === "Culture" ? "selected" : ""}`}
              data-category="Culture"
              aria-pressed={category === "Culture"}
              onClick={() => setCategory("Culture")}
            >
              Culture
            </button>
            <button
              className={`filter-tab ${category === "Nature" ? "selected" : ""}`}
              data-category="Nature"
              aria-pressed={category === "Nature"}
              onClick={() => setCategory("Nature")}
            >
              Nature
            </button>
            <button
              className={`filter-tab ${category === "Food" ? "selected" : ""}`}
              data-category="Food"
              aria-pressed={category === "Food"}
              onClick={() => setCategory("Food")}
            >
              Food &amp; market
            </button>
          </div>
          <label className="sort-control" htmlFor="sort-select">
            SORT
            <select
              id="sort-select"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="curated">Curated</option>
              <option value="duration">Quick visits</option>
              <option value="hidden">Hidden gems first</option>
            </select>
          </label>
        </div>
        <div className="results-line">
          <span id="results-label">
            {filtered.length > 0 && (search || category !== "All")
              ? `${filtered.length} ${
                  filtered.length === 1 ? "place" : "places"
                } for this view`
              : "A few good places to begin"}
          </span>
          <span className="results-count" id="results-count" aria-hidden="true">
            {filtered.length}
          </span>
          <span className="results-location">
            <i></i> MANGALURU, KA
          </span>
        </div>

        {loading || error ? (
          <div className="destination-grid" id="destination-grid" aria-live="polite">
            {error ? (
              <div className="data-error">
                Places are taking a moment to load. Refresh to try again.
              </div>
            ) : (
              <div className="data-error">Loading places…</div>
            )}
          </div>
        ) : (
          <>
            <div className="destination-grid" id="destination-grid" aria-live="polite">
              {filtered.slice(0, visibleLimit).map((destination) => {
                const isSelected = selected.includes(destination.id);
                return (
                  <article
                    key={destination.id}
                    className="destination-card"
                    data-cursor-label="OPEN PLACE"
                    data-id={destination.id}
                    tabIndex={0}
                    aria-label={`${destination.name} destination card`}
                    onClick={() => setActiveDestination(destination)}
                  >
                    <div
                      className="card-image"
                      style={{
                        "--card-image-position":
                          destination.imagePosition || "center",
                        backgroundImage: `linear-gradient(145deg,rgba(49,35,58,.12),rgba(49,35,58,.2)),url('${destination.image}')`,
                        backgroundPosition: destination.imagePosition || "center",
                      }}
                    >
                      <div className="card-topline">
                        <span className="card-category">{destination.category}</span>
                        {destination.hiddenGem && (
                          <span className="gem-label">LESSER-KNOWN PICK</span>
                        )}
                        <button
                          className={`card-bookmark ${isFavorite(destination.id) ? "is-favorite" : ""}`}
                          data-action="favorite"
                          aria-label={
                            isFavorite(destination.id)
                              ? "Remove from favourites"
                              : "Add to favourites"
                          }
                          ariaPressed={isFavorite(destination.id)}
                          onClick={() => toggleFavorite(destination.id)}
                        >
                          {isFavorite(destination.id) ? "♥" : "♡"}
                        </button>
                      </div>
                      <span className="illustrative-label">ILLUSTRATIVE PHOTO</span>
                      <div className="card-bottom">
                        <span>{destination.area.toUpperCase()}</span>
                        <span>DETAILS ↗</span>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="card-area">{destination.area}</div>
                      <div className="card-title-row">
                        <h3 className="card-title">{destination.name}</h3>
                        <span className="card-title-arrow" aria-hidden="true">
                          ↗
                        </span>
                      </div>
                      <p className="card-tagline">{destination.tagline}</p>
                      <div className="card-footer">
                        <span className="card-duration">
                          ◷ &nbsp; About{" "}
                          {Math.round(destination.duration / 15) * 15} min · estimate
                        </span>
                        <button
                          className={`add-place ${isSelected ? "added" : ""}`}
                          data-action="add"
                          aria-label={
                            isSelected
                              ? `Remove ${destination.name} from your itinerary`
                              : `Add ${destination.name} to your itinerary`
                          }
                          ariaPressed={isSelected}
                          onClick={() => toggleSelect(destination.id)}
                        >
                          {isSelected ? "✓" : "+"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            <div
              className="no-results"
              id="no-results"
              hidden={filtered.length > 0}
            >
              <span className="no-results-icon">⌕</span>
              <h3>No places found yet.</h3>
              <p>Try another search or choose another category.</p>
              <button className="text-button" id="clear-filters" onClick={handleClearFilters}>
                Clear filters <span>↗</span>
              </button>
            </div>
            <div className="load-more-row">
              <span>MORE COAST, LESS CHECKLIST.</span>
              <button
                className="outline-button"
                id="show-all"
                hidden={filtered.length <= 9 && visibleLimit <= 9}
                onClick={() =>
                  setVisibleLimit(visibleLimit > 9 ? 9 : destinations.length)
                }
              >
                {visibleLimit > 9 ? "Show fewer places" : "Show all places"}
                <span>↗</span>
              </button>
            </div>
          </>
        )}
      </>
    );
  }

  function renderPlannerCard() {
    return (
      <aside className="planner-card" id="planner" aria-labelledby="planner-title">
        <div className="planner-topline">
          <span>YOUR DAY, YOUR WAY</span>
          <span className="planner-spark">✳</span>
        </div>
        <h3 id="planner-title">
          Make a<br /> <em>little plan.</em>
        </h3>
        <p className="planner-lede">
          Collect a few places. We’ll help put them in a sensible order.
        </p>
        <div className="planner-fields">
          <label className="field-label" htmlFor="start-location">
            STARTING NEAR
          </label>
          <div className="input-with-icon">
            <span className="pin-icon">⌖</span>
            <select id="start-location">
              <option value="city" data-lat="12.8703" data-lng="74.843">
                Mangaluru city centre
              </option>
              <option value="central" data-lat="12.863" data-lng="74.843">
                Mangaluru Central Station
              </option>
              <option value="airport" data-lat="12.9613" data-lng="74.8901">
                Mangaluru Airport
              </option>
              <option value="panambur" data-lat="12.948" data-lng="74.808">
                Panambur coast
              </option>
            </select>
          </div>
          <div className="field-pair">
            <label>
              <span className="field-label">TRAVEL DATE</span>
              <input id="trip-date" type="date" />
            </label>
            <label>
              <span className="field-label">TIME TO EXPLORE</span>
              <select id="trip-hours">
                <option value="3">3 hours</option>
                <option value="5" selected>
                  5 hours
                </option>
                <option value="8">Full day</option>
              </select>
            </label>
          </div>
          <label className="field-label" htmlFor="travel-mode">
            GETTING AROUND
          </label>
          <select id="travel-mode" className="mode-select">
            <option value="car">Car / taxi</option>
            <option value="scooter">Scooter</option>
            <option value="transit">Public transport</option>
            <option value="walk">On foot</option>
          </select>
        </div>
        <div className="selected-wrap">
          <div className="selected-heading">
            <span>YOUR STOPS</span>
            <span id="selected-count">{selected.length} / 6</span>
          </div>
          <div className="selected-list" id="selected-list">
            {selected.length === 0 ? (
              <div className="empty-selection">
                <span className="empty-plus">+</span>
                <span>Add a place to start your route.</span>
              </div>
            ) : (
              selected.map((id, index) => {
                const destination = destinations.find((d) => d.id === id);
                if (!destination) return null;
                return (
                  <div
                    key={id}
                    className="selected-stop"
                    data-id={id}
                  >
                    <span className="stop-number">{index + 1}</span>
                    <span className="stop-name" title={destination.name}>
                      {destination.name}
                    </span>
                    <span className="stop-tools">
                      <button
                        className="stop-tool"
                        data-action="up"
                        aria-label={`Move ${destination.name} earlier`}
                        disabled={index === 0}
                      >
                        ↑
                      </button>
                      <button
                        className="stop-tool"
                        data-action="down"
                        aria-label={`Move ${destination.name} later`}
                        disabled={index === selected.length - 1}
                      >
                        ↓
                      </button>
                      <button
                        className="stop-tool"
                        data-action="remove"
                        aria-label={`Remove ${destination.name}`}
                        onClick={() => toggleSelect(id)}
                      >
                        ×
                      </button>
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <button
          className="primary-button generate-button"
          id="generate-route"
          disabled={selected.length === 0}
        >
          Arrange my stops <span aria-hidden="true">↗</span>
        </button>
        <div className="planner-actions" id="planner-actions" hidden>
          <button className="outline-button" id="save-itinerary">
            Save this day
          </button>
          <button className="outline-button" id="share-trip" onClick={shareTrip}>
            Share plan
          </button>
        </div>
        <div className="planner-footnote">
          <span className="footnote-symbol">ⓘ</span>
          Route order and travel times are estimates, not live directions.
        </div>
      </aside>
    );
  }
}
