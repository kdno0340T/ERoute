"use client";

import { createContext, useContext, useReducer, useEffect, useCallback, useRef, useState } from "react";

const DestinationContext = createContext(null);

const STORAGE_KEYS = {
  favorites: "router-favorites",
  savedTrips: "router-saved-trips",
};

const safeRead = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const safeWrite = (key, value) => {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

const STARTS = {
  city: { name: "Mangaluru city centre", lat: 12.8703, lng: 74.843 },
  central: { name: "Mangaluru Central Station", lat: 12.863, lng: 74.843 },
  airport: { name: "Mangaluru Airport", lat: 12.9613, lng: 74.8901 },
  panambur: { name: "Panambur coast", lat: 12.948, lng: 74.808 },
};

const MODE_SPEEDS = { car: 28, scooter: 25, transit: 18, walk: 4.5 };
const MODE_NAMES = { car: "Car / taxi", scooter: "Scooter", transit: "Public transport", walk: "On foot" };

const initialState = {
  destinations: [],
  category: "All",
  search: "",
  sort: "curated",
  visibleLimit: 9,
  selected: [],
  isGenerated: false,
  favorites: new Set(safeRead(STORAGE_KEYS.favorites, [])),
  savedTrips: safeRead(STORAGE_KEYS.savedTrips, []),
  activeDestination: null,
  loading: true,
  error: null,
  toastMessage: null,
  announceMessage: null,
};

function categoryMatches(destination, category) {
  if (category === "All") return true;
  if (category === "Culture")
    return destination.category === "Culture" || destination.category === "Heritage";
  return destination.category === category;
}

function haversineKm(a, b) {
  const radians = (degrees) => (degrees * Math.PI) / 180;
  const lat1 = radians(a.lat);
  const lat2 = radians(b.lat);
  const dLat = lat2 - lat1;
  const dLng = radians(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function projectPoint(point) {
  const lngMin = 74.79, lngMax = 74.97, latMin = 12.77, latMax = 13.075;
  const x = 205 + ((point.lng - lngMin) / (lngMax - lngMin)) * 630;
  const y = 35 + ((latMax - point.lat) / (latMax - latMin)) * 405;
  return { x: Math.max(170, Math.min(865, x)), y: Math.max(30, Math.min(455, y)) };
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_DESTINATIONS":
      return { ...state, destinations: action.payload, loading: false, error: null };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "SET_CATEGORY":
      return { ...state, category: action.payload, visibleLimit: 9 };
    case "SET_SEARCH":
      return { ...state, search: action.payload, visibleLimit: 9 };
    case "SET_SORT":
      return { ...state, sort: action.payload };
    case "SET_VISIBLE_LIMIT":
      return { ...state, visibleLimit: action.payload };
    case "TOGGLE_SELECT": {
      const id = action.payload;
      if (state.selected.includes(id)) {
        return { ...state, selected: state.selected.filter((sid) => sid !== id) };
      }
      if (state.selected.length >= 6) return state;
      return { ...state, selected: [...state.selected, id] };
    }
    case "SET_SELECTED":
      return { ...state, selected: action.payload };
    case "TOGGLE_FAVORITE": {
      const id = action.payload;
      const next = new Set(state.favorites);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      safeWrite(STORAGE_KEYS.favorites, [...next]);
      return { ...state, favorites: next };
    }
    case "SET_ACTIVE_DESTINATION":
      return { ...state, activeDestination: action.payload };
    case "SET_IS_GENERATED":
      return { ...state, isGenerated: action.payload };
    case "SET_TOAST":
      return { ...state, toastMessage: action.payload };
    case "CLEAR_TOAST":
      return { ...state, toastMessage: null };
    case "SET_ANNOUNCE":
      return { ...state, announceMessage: action.payload };
    case "SET_SAVED_TRIPS":
      return { ...state, savedTrips: action.payload };
    default:
      return state;
  }
}

export function DestinationProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const toastTimerRef = useRef(null);
  const [tripParsed, setTripParsed] = useState(false);
  // Fetch destinations on mount
  useEffect(() => {
    let cancelled = false;
    dispatch({ type: "SET_LOADING", payload: true });
    fetch("/api/destinations", { headers: { Accept: "application/json" } })
      .then((response) => {
        if (!response.ok) throw new Error("Destination request failed");
        return response.json();
      })
      .then((data) => {
        if (!cancelled) {
          dispatch({ type: "SET_DESTINATIONS", payload: Array.isArray(data) ? data : [] });
        }
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: "SET_ERROR", payload: true });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredDestinations = useCallback(() => {
    const query = state.search.trim().toLowerCase();
    let items = state.destinations.filter((destination) => {
      const matchesCategory = categoryMatches(destination, state.category);
      const searchable = [
        destination.name,
        destination.category,
        destination.area,
        destination.tagline,
        destination.description,
        ...(destination.interests || []),
      ]
        .join(" ")
        .toLowerCase();
      return matchesCategory && (!query || searchable.includes(query));
    });
    if (state.sort === "duration")
      items = [...items].sort((a, b) => a.duration - b.duration);
    if (state.sort === "hidden")
      items = [...items].sort((a, b) => Number(b.hiddenGem) - Number(a.hiddenGem));
    return items;
  }, [state.destinations, state.category, state.search, state.sort]);

  const getDestination = useCallback(
    (id) => state.destinations.find((d) => d.id === id),
    [state.destinations]
  );

  const toast = useCallback(
    (message) => {
      dispatch({ type: "SET_TOAST", payload: message });
      dispatch({ type: "SET_ANNOUNCE", payload: message });
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => {
        dispatch({ type: "CLEAR_TOAST" });
      }, 2800);
    },
    []
  );

  const markRouteDirty = useCallback(() => {
    dispatch({ type: "SET_IS_GENERATED", payload: false });
  }, []);

  const addDestination = useCallback(
    (id) => {
      if (state.selected.includes(id)) {
        const removed = getDestination(id);
        dispatch({ type: "TOGGLE_SELECT", payload: id });
        toast(`${removed?.name || "Place"} removed from your day.`);
      } else {
        if (state.selected.length >= 6) {
          toast("Keep a day to six stops or fewer for now.");
          return;
        }
        const added = getDestination(id);
        dispatch({ type: "TOGGLE_SELECT", payload: id });
        toast(`${added?.name || "Place"} added to your day.`);
      }
      markRouteDirty();
    },
    [state.selected, getDestination, toast, markRouteDirty]
  );
  const generateRoute = useCallback(() => {
    if (!state.selected.length) return;
    const remaining = state.selected.map(getDestination).filter(Boolean);
    const ordered = [];
    let from = STARTS[document.getElementById("start-location")?.value] || STARTS.city;
    while (remaining.length) {
      let nearestIndex = 0;
      let nearestDistance = Infinity;
      remaining.forEach((destination, index) => {
        const distance = haversineKm(from, destination);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });
      const [next] = remaining.splice(nearestIndex, 1);
      ordered.push(next.id);
      from = next;
    }
    dispatch({ type: "SET_SELECTED", payload: ordered });
    dispatch({ type: "SET_IS_GENERATED", payload: true });
    const summary = routeSummary(state.selected, getDestination);
    const hoursEl = document.getElementById("trip-hours");
    const availableMinutes = Number(hoursEl?.value || 5) * 60;
    if (summary.totalMinutes > availableMinutes) {
      toast(`This day may need more than ${hoursEl?.value || 5} hours. Consider fewer stops or more time.`);
    } else {
      toast("Suggested order ready. Travel and visit times are estimates.");
    }
  }, [state.selected, getDestination, toast]);

  const saveTrip = useCallback(() => {
    if (!state.selected.length) {
      toast("Add a few places before saving a day.");
      return;
    }
    const startEl = document.getElementById("start-location");
    const modeEl = document.getElementById("travel-mode");
    const hoursEl = document.getElementById("trip-hours");
    const dateEl = document.getElementById("trip-date");
    const trip = {
      id: `trip-${Date.now()}`,
      title: `${state.selected.length} stops near Mangaluru`,
      createdAt: new Date().toISOString(),
      stops: state.selected,
      date: dateEl?.value || "",
      hours: hoursEl?.value || "5",
      mode: modeEl?.value || "car",
      start: startEl?.value || "city",
    };
    const next = [trip, ...state.savedTrips].slice(0, 20);
    if (!safeWrite(STORAGE_KEYS.savedTrips, next)) {
      toast("This browser could not save the itinerary on this device.");
      return;
    }
    dispatch({ type: "SET_SAVED_TRIPS", payload: next });
    toast("Your day is saved on this device.");
  }, [state.selected, state.savedTrips, toast]);

  const loadTrip = useCallback((payload) => {
    if (!payload || payload.version !== 1) return;
    const validStops = (Array.isArray(payload.stops) ? payload.stops : [])
      .filter((id) => getDestination(id))
      .slice(0, 6);
    if (!validStops.length) return;
    const startEl = document.getElementById("start-location");
    const modeEl = document.getElementById("travel-mode");
    const hoursEl = document.getElementById("trip-hours");
    const dateEl = document.getElementById("trip-date");
    if (STARTS[payload.start]) startEl.value = payload.start;
    if (["car", "scooter", "transit", "walk"].includes(payload.mode)) modeEl.value = payload.mode;
    if (["3", "5", "8"].includes(String(payload.hours))) hoursEl.value = String(payload.hours);
    if (payload.date && /^\d{4}-\d{2}-\d{2}$/.test(payload.date)) dateEl.value = payload.date;
    dispatch({ type: "SET_SELECTED", payload: validStops });
    dispatch({ type: "SET_IS_GENERATED", payload: false });
    generateRoute();
    toast("A shared Mangaluru day is ready to explore.");
  }, [getDestination, toast, generateRoute]);

  // Parse ?trip= shared itinerary on first load
  useEffect(() => {
    if (tripParsed || state.destinations.length === 0) return;
    const value = new URLSearchParams(window.location.search).get("trip");
    if (!value) return;
    try {
      const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
      const json = decodeURIComponent(escape(atob(normalized)));
      const payload = JSON.parse(json);
      loadTrip(payload);
      setTripParsed(true);
    } catch {
      toast("This shared itinerary link could not be read.");
    }
  }, [state.destinations.length, tripParsed, loadTrip, toast]);

  const routeSummary = useCallback((selected, getDest) => {
    const stops = selected.map(getDest).filter(Boolean);
    if (!stops.length) return { distance: 0, travelMinutes: 0, visitMinutes: 0, totalMinutes: 0 };
    const points = [
      STARTS[document.getElementById("start-location")?.value] || STARTS.city,
      ...stops.map(({ lat, lng }) => ({ lat, lng })),
    ];
    const straightDistance = points.slice(1).reduce((sum, point, index) => sum + haversineKm(points[index], point), 0);
    const estimatedDistance = straightDistance * 1.25;
    const speed = MODE_SPEEDS[document.getElementById("travel-mode")?.value || "car"] || MODE_SPEEDS.car;
    const travelMinutes = (estimatedDistance / speed) * 60;
    const visitMinutes = stops.reduce((sum, destination) => sum + destination.duration, 0);
    return { distance: estimatedDistance, travelMinutes, visitMinutes, totalMinutes: travelMinutes + visitMinutes };
  }, [haversineKm]);

  const todayLocal = useCallback(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }, []);

  const sharePayload = useCallback(() => {
    return {
      version: 1,
      stops: state.selected,
      date: document.getElementById("trip-date")?.value || "",
      hours: document.getElementById("trip-hours")?.value || "5",
      mode: document.getElementById("travel-mode")?.value || "car",
      start: document.getElementById("start-location")?.value || "city",
    };
  }, [state.selected]);

  const tripUrl = useCallback(
    (payload = sharePayload()) => {
      const encoded = btoa(
        unescape(encodeURIComponent(JSON.stringify(payload)))
      )
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
      return `${window.location.origin}${window.location.pathname}?trip=${encoded}#planner`;
    },
    [sharePayload]
  );

  const copyTripUrl = useCallback(
    async (payload) => {
      const url = tripUrl(payload);
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        return url;
      }
      const input = document.createElement("textarea");
      input.value = url;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
      return url;
    },
    [tripUrl]
  );

  const shareTrip = useCallback(async () => {
    if (!state.selected.length) {
      toast("Add a few places before sharing a day.");
      return;
    }
    if (!state.isGenerated) {
      generateRoute();
    }
    const url = tripUrl();
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My RoutER coastal day",
          text: "A few places for a day in Mangaluru.",
          url,
        });
      } else {
        await copyTripUrl();
        toast("A shareable itinerary link is copied.");
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        toast("Could not share just now. Try copying the page link.");
      }
    }
  }, [state.selected, state.isGenerated, toast, generateRoute, tripUrl, copyTripUrl]);

  const value = {
    ...state,
    STARTS,
    MODE_SPEEDS,
    MODE_NAMES,
    filteredDestinations,
    getDestination,
    dispatch,
    toast,
    addDestination,
    generateRoute,
    saveTrip,
    loadTrip,
    shareTrip,
    copyTripUrl,
    routeSummary,
    todayLocal,
    setCategory: (category) => dispatch({ type: "SET_CATEGORY", payload: category }),
    setSearch: (search) => dispatch({ type: "SET_SEARCH", payload: search }),
    setSort: (sort) => dispatch({ type: "SET_SORT", payload: sort }),
    setVisibleLimit: (limit) => dispatch({ type: "SET_VISIBLE_LIMIT", payload: limit }),
    toggleSelect: (id) => dispatch({ type: "TOGGLE_SELECT", payload: id }),
    setSelected: (selected) => dispatch({ type: "SET_SELECTED", payload: selected }),
    toggleFavorite: (id) => dispatch({ type: "TOGGLE_FAVORITE", payload: id }),
    setActiveDestination: (destination) => dispatch({ type: "SET_ACTIVE_DESTINATION", payload: destination }),
  };

  return (
    <DestinationContext.Provider value={value}>
      {children}
    </DestinationContext.Provider>
  );
}

export function useDestination() {
  const context = useContext(DestinationContext);
  if (!context) throw new Error("useDestination must be used within DestinationProvider");
  return context;
}
