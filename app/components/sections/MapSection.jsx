"use client";

import { useDestination } from "../state/DestinationContext";

const NS = "http://www.w3.org/2000/svg";

const projectPoint = (point) => {
  const lngMin = 74.79, lngMax = 74.97, latMin = 12.77, latMax = 13.075;
  const x = 205 + ((point.lng - lngMin) / (lngMax - lngMin)) * 630;
  const y = 35 + ((latMax - point.lat) / (latMax - latMin)) * 405;
  return { x: Math.max(170, Math.min(865, x)), y: Math.max(30, Math.min(455, y)) };
};

export default function MapSection() {
  const {
    selected,
    isGenerated,
    getDestination,
    destinations,
  } = useDestination();
  const stops = selected.map(getDestination).filter(Boolean);

  const nearbyNames = [
    ...new Set(stops.flatMap((d) => d.nearby || [])),
  ];
  let nearby = nearbyNames
    .map((name) => destinations.find((d) => d.name === name))
    .filter((d) => d && !selected.includes(d.id));
  if (!nearby.length) {
    nearby = destinations.filter(
      (d) => !selected.includes(d.id) && (d.category === "Food" || d.hiddenGem)
    );
  }

  const points = [
    { name: "Start", lat: 12.8703, lng: 74.843 },
    ...stops,
  ];
  const projected = points.map(projectPoint);

  const routeD = projected
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(" ");

  const straightDistance = points.slice(1).reduce((sum, point, index) => {
    const dLat = ((point.lat - points[index].lat) * Math.PI) / 180;
    const dLng = ((point.lng - points[index].lng) * Math.PI) / 180;
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((points[index].lat * Math.PI) / 180) *
        Math.cos((point.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return sum + 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }, 0);
  const estimatedDistance = straightDistance * 1.25;
  const speed = 28;
  const travelMinutes = (estimatedDistance / speed) * 60;

  return (
    <section
      className="map-section content-width"
      id="map-section"
      aria-labelledby="map-title"
    >
      <div className="section-heading map-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line"></span> A SENSE OF THE JOURNEY
          </div>
          <h2 id="map-title">
            {isGenerated && stops.length
              ? "A day by<br /><em>the coast.</em>"
              : "See how it <em>fits.</em>"}
          </h2>
        </div>
        <p className="map-heading-copy">
          {isGenerated && stops.length
            ? `${stops.length} stops from Mangaluru city centre. Order is estimated from nearby coordinates.`
            : "Your selected stops, together on one map. Add a place to see your route take shape."}
        </p>
      </div>
      <div className="map-card">
        <div className="map-canvas" id="map-canvas" role="img" aria-label="Illustrative map of Mangaluru and selected itinerary stops">
          <svg
            className="route-map"
            id="route-map"
            viewBox="0 0 900 480"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="mapGrid"
                width="42"
                height="42"
                patternUnits="userSpaceOnUse"
              >
                <path d="M42 0H0V42" fill="none" stroke="#d4c4b5" stroke-width=".6" opacity=".62" />
              </pattern>
              <filter id="mapShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#31243c" flood-opacity=".17" />
              </filter>
            </defs>
            <rect width="900" height="480" fill="#f2e8da" />
            <rect width="900" height="480" fill="url(#mapGrid)" />
            <path className="map-water" d="M0 0h142c-20 38 6 62-18 96s-6 67-33 94 13 64-9 91-7 51-31 77 7 82-14 122H0z" />
            <path className="map-coastline" d="M142 0c-20 38 6 62-18 96s-6 67-33 94 13 64-9 91-7 51-31 77 7 82-14 122" />
            <path className="map-road" d="M192 458c23-73 74-102 111-143s49-75 74-114 65-70 106-78 68 16 91-14 52-64 89-89" />
            <path className="map-road secondary" d="M164 64c93 23 138 70 192 74s75-26 122-12 72 56 114 63 75-28 153-21" />
            <path className="map-road secondary" d="M237 460c20-51 18-115 1-172s-14-98 20-151 80-74 111-125" />
            <path className="map-river" d="M104 139c88-7 138 24 197 7s95-72 155-61 79 75 146 61 106-39 190-21" />
            <text className="map-label water-label" x="20" y="252">
              ARABIAN SEA
            </text>
            <text className="map-label town-label" x="448" y="224">
              MANGALURU
            </text>
            <text className="map-label small-label" x="318" y="88">
              KAVOOR
            </text>
            <text className="map-label small-label" x="672" y="340">
              PILIKULA
            </text>
            <text className="map-label small-label" x="185" y="395">
              ULLAL
            </text>
            {stops.length > 0 && (
              <path
                className="map-route-line"
                id="route-layer-line"
                d={routeD}
              />
            )}
            {projected.map((point, index) => {
              const isStart = index === 0;
              const destination = stops[index - 1];
              return (
                <g
                  key={index}
                  className={`map-stop${isStart ? " map-start" : ""}`}
                  transform={`translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})`}
                >
                  <circle r={isStart ? 10 : 12} />
                  <text y={1}>{isStart ? "S" : String(index)}</text>
                  <title>
                    {isStart
                      ? `Start: Mangaluru city centre`
                      : `${index}. ${destination?.name}`}
                  </title>
                  {!isStart && destination && (
                    <text
                      className="map-label-stop"
                      x={point.x + 14}
                      y={point.y - 12}
                    >
                      {destination.name}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          <div className="map-compass">
            <span>N</span>
            <b>↑</b>
          </div>
          <div className="map-legend">
            <span>
              <i className="legend-start"></i> START
            </span>
            <span>
              <i className="legend-stop"></i> YOUR STOPS
            </span>
            <span>
              <i className="legend-route"></i> SUGGESTED ORDER
            </span>
          </div>
        </div>
        <div className="map-sidebar">
          <div className="map-side-top">
            <span className="map-kicker">YOUR COASTAL LOOP</span>
            <span className="map-icon">↗</span>
          </div>
          <h3 id="map-route-title">
            {isGenerated && stops.length
              ? "A day by<br /><em>the coast.</em>"
              : "A route is<br /><em>waiting.</em>"}
          </h3>
          <p id="map-route-copy">
            {isGenerated && stops.length
              ? `${stops.length} stops from Mangaluru city centre. Order is estimated from nearby coordinates.`
              : "Add a few places to your day and see how they connect."}
          </p>
          <div className="route-nearby" id="route-nearby" hidden={nearby.length === 0}>
            <span className="nearby-heading">A LITTLE MORE NEARBY</span>
            <div id="route-nearby-list">
              {nearby.slice(0, 2).map((destination) => (
                <button
                  key={destination.id}
                  className="nearby-pick"
                  data-nearby-id={destination.id}
                  onClick={() => {
                    // add to itinerary handled via context in a later phase
                  }}
                >
                  <span>{destination.name}</span>
                  <span aria-hidden="true">+</span>
                </button>
              ))}
            </div>
            <span className="nearby-note">
              Editorial proximity suggestions · confirm road access locally.
            </span>
          </div>
          <div className="route-stats">
            <div>
              <strong id="route-stop-stat">{stops.length}</strong>
              <span>STOPS</span>
            </div>
            <div>
              <strong id="route-distance-stat">
                {stops.length > 0 ? estimatedDistance.toFixed(1) : "—"}
              </strong>
              <span>APPROX. KM</span>
            </div>
            <div>
              <strong id="route-time-stat">
                {stops.length > 0 ? `${Math.max(1, Math.round(travelMinutes / 15) * 15)}m` : "—"}
              </strong>
              <span>EST. TRAVEL</span>
            </div>
          </div>
          <button className="text-link map-plan-link" id="map-plan-link" onClick={() => {
            document.getElementById("planner")?.scrollIntoView({ behavior: "smooth" });
          }}>
            Build your itinerary <span>↗</span>
          </button>
          <div className="map-disclaimer">
            Illustrative map · coordinate-based distance and time estimates, not road directions or
            live traffic.
          </div>
        </div>
      </div>
    </section>
  );
}