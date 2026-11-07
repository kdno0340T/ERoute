(() => {
  if (window.__routerAppInitialized) return;
  window.__routerAppInitialized = true;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const safeRead = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  };
  const safeWrite = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  };

  const state = {
    destinations: [],
    category: 'All',
    search: '',
    sort: 'curated',
    visibleLimit: 9,
    selected: [],
    isGenerated: false,
    favorites: new Set(safeRead('router-favorites', [])),
    savedTrips: safeRead('router-saved-trips', []),
    activeDestination: null,
    toastTimer: null,
  };

  const ui = {
    grid: $('#destination-grid'),
    noResults: $('#no-results'),
    search: $('#search-input'),
    filterTabs: $('#filter-tabs'),
    sort: $('#sort-select'),
    allCount: $('#all-count'),
    resultsLabel: $('#results-label'),
    showAll: $('#show-all'),
    selectedList: $('#selected-list'),
    selectedCount: $('#selected-count'),
    navCount: $('#nav-count'),
    generate: $('#generate-route'),
    plannerActions: $('#planner-actions'),
    start: $('#start-location'),
    date: $('#trip-date'),
    hours: $('#trip-hours'),
    mode: $('#travel-mode'),
    routeLayer: $('#route-layer'),
    modalBackdrop: $('#modal-backdrop'),
    modalTitle: $('#modal-title'),
    modalKicker: $('#modal-kicker'),
    modalDescription: $('#modal-description'),
    modalImage: $('#modal-image'),
    modalFacts: $('#modal-facts'),
    toast: $('#toast'),
    drawer: $('#saved-drawer'),
    drawerShade: $('#drawer-shade'),
  };

  const STARTS = {
    city: { name: 'Mangaluru city centre', lat: 12.8703, lng: 74.843 },
    central: { name: 'Mangaluru Central Station', lat: 12.863, lng: 74.843 },
    airport: { name: 'Mangaluru Airport', lat: 12.9613, lng: 74.8901 },
    panambur: { name: 'Panambur coast', lat: 12.948, lng: 74.808 },
  };
  const MODE_SPEEDS = { car: 28, scooter: 25, transit: 18, walk: 4.5 };
  const MODE_NAMES = { car: 'Car / taxi', scooter: 'Scooter', transit: 'Public transport', walk: 'On foot' };
  const NS = 'http://www.w3.org/2000/svg';

  function announce(message) {
    const live = $('#live-region');
    if (live) live.textContent = message;
  }

  function emitMotion(name) {
    const root = document.querySelector('#legacy-app');
    (root || document).dispatchEvent(new CustomEvent(`router:${name}`, { bubbles: true }));
  }

  function toast(message) {
    clearTimeout(state.toastTimer);
    ui.toast.textContent = message;
    ui.toast.classList.add('visible');
    emitMotion('toast');
    state.toastTimer = setTimeout(() => ui.toast.classList.remove('visible'), 2800);
    announce(message);
  }

  function getDestination(id) {
    return state.destinations.find((destination) => destination.id === id);
  }

  function categoryMatches(destination, category) {
    if (category === 'All') return true;
    if (category === 'Culture') return destination.category === 'Culture' || destination.category === 'Heritage';
    return destination.category === category;
  }

  function filteredDestinations() {
    const query = state.search.trim().toLowerCase();
    let items = state.destinations.filter((destination) => {
      const matchesCategory = categoryMatches(destination, state.category);
      const searchable = [destination.name, destination.category, destination.area, destination.tagline, destination.description, ...(destination.interests || [])].join(' ').toLowerCase();
      return matchesCategory && (!query || searchable.includes(query));
    });

    if (state.sort === 'duration') items = [...items].sort((a, b) => a.duration - b.duration);
    if (state.sort === 'hidden') items = [...items].sort((a, b) => Number(b.hiddenGem) - Number(a.hiddenGem));
    return items;
  }

  function cardMarkup(destination) {
    const selected = state.selected.includes(destination.id);
    const favorite = state.favorites.has(destination.id);
    return `<article class="destination-card" data-cursor-label="OPEN PLACE" data-id="${escapeHTML(destination.id)}" tabindex="0" aria-label="${escapeHTML(destination.name)} destination card">
      <div class="card-image" style="--card-image-position:${escapeHTML(destination.imagePosition || 'center')};background-image:linear-gradient(145deg,rgba(49,35,58,.12),rgba(49,35,58,.2)),url('${escapeHTML(destination.image)}');background-position:${escapeHTML(destination.imagePosition || 'center')}">
        <div class="card-topline"><span class="card-category">${escapeHTML(destination.category)}</span>${destination.hiddenGem ? '<span class="gem-label">LESSER-KNOWN PICK</span>' : ''}<button class="card-bookmark ${favorite ? 'is-favorite' : ''}" data-action="favorite" aria-label="${favorite ? 'Remove from' : 'Add to'} favourites" aria-pressed="${favorite}">${favorite ? '♥' : '♡'}</button></div>
        <span class="illustrative-label">ILLUSTRATIVE PHOTO</span>
        <div class="card-bottom"><span>${escapeHTML(destination.area.toUpperCase())}</span><span>DETAILS ↗</span></div>
      </div>
      <div class="card-body"><div class="card-area">${escapeHTML(destination.area)}</div><div class="card-title-row"><h3 class="card-title">${escapeHTML(destination.name)}</h3><span class="card-title-arrow" aria-hidden="true">↗</span></div><p class="card-tagline">${escapeHTML(destination.tagline)}</p><div class="card-footer"><span class="card-duration">◷ &nbsp;About ${Math.round(destination.duration / 15) * 15} min · estimate</span><button class="add-place ${selected ? 'added' : ''}" data-action="add" aria-label="${selected ? 'Remove' : 'Add'} ${escapeHTML(destination.name)} ${selected ? 'from' : 'to'} your itinerary" aria-pressed="${selected}">${selected ? '✓' : '+'}</button></div></div>
    </article>`;
  }

  function renderCards() {
    const filtered = filteredDestinations();
    ui.allCount.textContent = state.destinations.length;
    ui.grid.innerHTML = filtered.slice(0, state.visibleLimit).map(cardMarkup).join('');
    ui.noResults.hidden = filtered.length > 0;
    ui.grid.hidden = filtered.length === 0;
    ui.resultsLabel.textContent = state.search || state.category !== 'All'
      ? `${filtered.length} ${filtered.length === 1 ? 'place' : 'places'} for this view`
      : 'A few good places to begin';
    ui.showAll.hidden = filtered.length <= 9 && state.visibleLimit <= 9;
    ui.showAll.innerHTML = state.visibleLimit > 9 ? 'Show fewer places <span>↗</span>' : 'Show all places <span>↗</span>';
    $$('.filter-tab', ui.filterTabs).forEach((button) => {
      const active = button.dataset.category === state.category;
      button.classList.toggle('selected', active);
      button.setAttribute('aria-pressed', String(active));
    });
    emitMotion('cards-rendered');
  }

  function markRouteDirty() {
    state.isGenerated = false;
    ui.plannerActions.hidden = true;
    ui.generate.textContent = state.selected.length ? 'Arrange my stops ↗' : 'Arrange my stops ↗';
    ui.generate.disabled = state.selected.length === 0;
    renderSelection();
    renderCards();
    renderMap();
  }

  function addDestination(id) {
    if (state.selected.includes(id)) {
      state.selected = state.selected.filter((selectedId) => selectedId !== id);
      toast(`${getDestination(id)?.name || 'Place'} removed from your day.`);
    } else {
      if (state.selected.length >= 6) return toast('Keep a day to six stops or fewer for now.');
      state.selected.push(id);
      toast(`${getDestination(id)?.name || 'Place'} added to your day.`);
    }
    markRouteDirty();
  }

  function renderSelection() {
    const total = state.selected.length;
    ui.selectedCount.textContent = `${total} / 6`;
    ui.navCount.textContent = total;
    ui.generate.disabled = total === 0;
    if (!total) {
      ui.selectedList.innerHTML = '<div class="empty-selection"><span class="empty-plus">+</span><span>Add a place to start your route.</span></div>';
      emitMotion('selection-rendered');
      return;
    }
    ui.selectedList.innerHTML = state.selected.map((id, index) => {
      const destination = getDestination(id);
      if (!destination) return '';
      return `<div class="selected-stop" data-id="${escapeHTML(id)}"><span class="stop-number">${index + 1}</span><span class="stop-name" title="${escapeHTML(destination.name)}">${escapeHTML(destination.name)}</span><span class="stop-tools"><button class="stop-tool" data-action="up" aria-label="Move ${escapeHTML(destination.name)} earlier" ${index === 0 ? 'disabled' : ''}>↑</button><button class="stop-tool" data-action="down" aria-label="Move ${escapeHTML(destination.name)} later" ${index === total - 1 ? 'disabled' : ''}>↓</button><button class="stop-tool" data-action="remove" aria-label="Remove ${escapeHTML(destination.name)}">×</button></span></div>`;
    }).join('');
    emitMotion('selection-rendered');
  }

  function startPoint() {
    return STARTS[ui.start.value] || STARTS.city;
  }

  function haversineKm(a, b) {
    const radians = (degrees) => degrees * Math.PI / 180;
    const lat1 = radians(a.lat);
    const lat2 = radians(b.lat);
    const dLat = lat2 - lat1;
    const dLng = radians(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }

  function arrangeStops() {
    if (state.selected.length < 2) return [...state.selected];
    const remaining = state.selected.map(getDestination).filter(Boolean);
    const ordered = [];
    let from = startPoint();
    while (remaining.length) {
      let nearestIndex = 0;
      let nearestDistance = Infinity;
      remaining.forEach((destination, index) => {
        const distance = haversineKm(from, destination);
        if (distance < nearestDistance) { nearestDistance = distance; nearestIndex = index; }
      });
      const [next] = remaining.splice(nearestIndex, 1);
      ordered.push(next.id);
      from = next;
    }
    return ordered;
  }

  function routeSummary() {
    const stops = state.selected.map(getDestination).filter(Boolean);
    if (!stops.length) return { distance: 0, travelMinutes: 0, visitMinutes: 0, totalMinutes: 0 };
    const points = [startPoint(), ...stops.map(({ lat, lng }) => ({ lat, lng }))];
    const straightDistance = points.slice(1).reduce((sum, point, index) => sum + haversineKm(points[index], point), 0);
    // These are planning estimates only; no road network or live traffic source is connected.
    const estimatedDistance = straightDistance * 1.25;
    const speed = MODE_SPEEDS[ui.mode.value] || MODE_SPEEDS.car;
    const travelMinutes = (estimatedDistance / speed) * 60;
    const visitMinutes = stops.reduce((sum, destination) => sum + destination.duration, 0);
    return { distance: estimatedDistance, travelMinutes, visitMinutes, totalMinutes: travelMinutes + visitMinutes };
  }

  function svgNode(name, attributes = {}) {
    const element = document.createElementNS(NS, name);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
    return element;
  }

  function projectPoint(point) {
    const lngMin = 74.79, lngMax = 74.97, latMin = 12.77, latMax = 13.075;
    const x = 205 + ((point.lng - lngMin) / (lngMax - lngMin)) * 630;
    const y = 35 + ((latMax - point.lat) / (latMax - latMin)) * 405;
    return { x: Math.max(170, Math.min(865, x)), y: Math.max(30, Math.min(455, y)) };
  }

  function renderMap() {
    ui.routeLayer.replaceChildren();
    const destinations = state.selected.map(getDestination).filter(Boolean);
    if (!destinations.length) {
      $('#route-nearby').hidden = true;
      $('#route-nearby-list').replaceChildren();
      $('#map-route-title').innerHTML = 'A route is<br><em>waiting.</em>';
      $('#map-route-copy').textContent = 'Add a few places to your day and see how they connect.';
      $('#route-stop-stat').textContent = '0';
      $('#route-distance-stat').textContent = '—';
      $('#route-time-stat').textContent = '—';
      emitMotion('map-rendered');
      return;
    }

    const points = [startPoint(), ...destinations];
    const projected = points.map(projectPoint);
    const route = svgNode('path', { class: 'map-route-line', d: projected.map((point, index) => `${index ? 'L' : 'M'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ') });
    ui.routeLayer.append(route);

    projected.forEach((point, index) => {
      const isStart = index === 0;
      const destination = destinations[index - 1];
      const marker = svgNode('g', { class: `map-stop${isStart ? ' map-start' : ''}`, transform: `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})` });
      marker.append(svgNode('circle', { r: isStart ? 10 : 12 }));
      const label = svgNode('text', { y: 1 });
      label.textContent = isStart ? 'S' : String(index);
      marker.append(label);
      marker.append(svgNode('title'));
      marker.lastElementChild.textContent = isStart ? `Start: ${startPoint().name}` : `${index}. ${destination.name}`;
      ui.routeLayer.append(marker);
      if (!isStart) {
        const placeLabel = svgNode('text', { class: 'map-label-stop', x: point.x + 14, y: point.y - 12 });
        placeLabel.textContent = destination.name;
        ui.routeLayer.append(placeLabel);
      }
    });

    const nearbyNames = [...new Set(destinations.flatMap((destination) => destination.nearby || []))];
    let nearby = nearbyNames.map((name) => state.destinations.find((destination) => destination.name === name)).filter((destination) => destination && !state.selected.includes(destination.id));
    if (!nearby.length) nearby = state.destinations.filter((destination) => !state.selected.includes(destination.id) && (destination.category === 'Food' || destination.hiddenGem));
    const nearbyList = $('#route-nearby-list');
    nearbyList.innerHTML = nearby.slice(0, 2).map((destination) => `<button class="nearby-pick" data-nearby-id="${escapeHTML(destination.id)}"><span>${escapeHTML(destination.name)}</span><span aria-hidden="true">+</span></button>`).join('');
    $('#route-nearby').hidden = nearby.length === 0;

    const summary = routeSummary();
    $('#map-route-title').innerHTML = state.isGenerated ? 'A day by<br><em>the coast.</em>' : 'Your stops,<br><em>taking shape.</em>';
    $('#map-route-copy').textContent = state.isGenerated
      ? `${destinations.length} stops from ${startPoint().name}. Order is estimated from nearby coordinates.`
      : 'These markers show your selected places. Arrange the stops to get a suggested sequence.';
    $('#route-stop-stat').textContent = String(destinations.length);
    $('#route-distance-stat').textContent = `${summary.distance.toFixed(1)}`;
    $('#route-time-stat').textContent = `${Math.max(1, Math.round(summary.travelMinutes / 15) * 15)}m`;
    emitMotion('map-rendered');
  }

  function generateRoute() {
    if (!state.selected.length) return;
    state.selected = arrangeStops();
    state.isGenerated = true;
    renderSelection();
    renderCards();
    renderMap();
    ui.plannerActions.hidden = false;
    ui.generate.innerHTML = 'Update stop order <span aria-hidden="true">↗</span>';
    const summary = routeSummary();
    const availableMinutes = Number(ui.hours.value) * 60;
    if (summary.totalMinutes > availableMinutes) {
      toast(`This day may need more than ${ui.hours.value} hours. Consider fewer stops or more time.`);
    } else {
      toast('Suggested order ready. Travel and visit times are estimates.');
    }
  }

  function renderModal(destination) {
    state.activeDestination = destination;
    ui.modalKicker.textContent = `${destination.category} · ${destination.area}`;
    ui.modalTitle.textContent = destination.name;
    ui.modalDescription.textContent = destination.description;
    ui.modalImage.style.backgroundImage = `url("${destination.image}")`;
    ui.modalImage.style.backgroundPosition = destination.imagePosition || 'center';
    ui.modalImage.setAttribute('role', 'img');
    ui.modalImage.setAttribute('aria-label', `Illustrative photo for ${destination.name}`);
    const facts = [
      `About ${Math.round(destination.duration / 15) * 15} min · estimate`,
      ...(destination.interests || []).slice(0, 3),
      destination.hiddenGem ? 'Local find' : 'Curated place',
    ];
    ui.modalFacts.innerHTML = facts.map((fact) => `<span class="modal-fact">${escapeHTML(fact)}</span>`).join('');
    ui.modalBackdrop.hidden = false;
    emitMotion('modal-opened');
    document.body.style.overflow = 'hidden';
    $('#modal-close').focus();
  }

  function closeModal(restoreFocus = true) {
    const destinationId = state.activeDestination?.id;
    ui.modalBackdrop.hidden = true;
    emitMotion('modal-closed');
    document.body.style.overflow = '';
    state.activeDestination = null;
    if (restoreFocus) {
      const sourceCard = $$('.destination-card', ui.grid).find((card) => card.dataset.id === destinationId);
      (sourceCard || ui.search).focus();
    }
  }

  function trapDialogFocus(dialog, event) {
    if (event.key !== 'Tab') return;
    const focusable = $$('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])', dialog).filter((element) => !element.hidden);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function sharePayload() {
    return {
      version: 1,
      stops: state.selected,
      date: ui.date.value,
      hours: ui.hours.value,
      mode: ui.mode.value,
      start: ui.start.value,
    };
  }

  function tripUrl(payload = sharePayload()) {
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    return `${window.location.origin}${window.location.pathname}?trip=${encoded}#planner`;
  }

  async function copyText(value) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const input = document.createElement('textarea');
    input.value = value;
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.append(input);
    input.select();
    document.execCommand('copy');
    input.remove();
  }

  async function shareTrip() {
    if (!state.selected.length) return toast('Add a few places before sharing a day.');
    if (!state.isGenerated) generateRoute();
    const url = tripUrl();
    try {
      if (navigator.share) await navigator.share({ title: 'My RoutER coastal day', text: 'A few places for a day in Mangaluru.', url });
      else { await copyText(url); toast('A shareable itinerary link is copied.'); }
    } catch (error) {
      if (error?.name !== 'AbortError') toast('Could not share just now. Try copying the page link.');
    }
  }

  function saveTrip() {
    if (!state.selected.length) return toast('Add a few places before saving a day.');
    if (!state.isGenerated) generateRoute();
    const trip = {
      id: `trip-${Date.now()}`,
      title: `${state.selected.length} stops near Mangaluru`,
      createdAt: new Date().toISOString(),
      ...sharePayload(),
    };
    state.savedTrips = [trip, ...state.savedTrips].slice(0, 20);
    if (!safeWrite('router-saved-trips', state.savedTrips)) return toast('This browser could not save the itinerary on this device.');
    renderSavedTrips();
    $('#saved-dot').hidden = false;
    toast('Your day is saved on this device.');
  }

  function loadTrip(payload) {
    if (!payload || payload.version !== 1) return;
    const validStops = (Array.isArray(payload.stops) ? payload.stops : []).filter((id) => getDestination(id)).slice(0, 6);
    if (!validStops.length) return;
    state.selected = validStops;
    if (STARTS[payload.start]) ui.start.value = payload.start;
    if (['car', 'scooter', 'transit', 'walk'].includes(payload.mode)) ui.mode.value = payload.mode;
    if (['3', '5', '8'].includes(String(payload.hours))) ui.hours.value = String(payload.hours);
    if (payload.date && /^\d{4}-\d{2}-\d{2}$/.test(payload.date)) ui.date.value = payload.date;
    state.isGenerated = false;
    renderSelection();
    renderCards();
    renderMap();
    generateRoute();
    toast('A shared Mangaluru day is ready to explore.');
  }

  function renderSavedTrips() {
    const container = $('#saved-list');
    $('#saved-dot').hidden = state.savedTrips.length === 0;
    if (!state.savedTrips.length) {
      container.innerHTML = '<div class="saved-empty">No saved days yet. Build an itinerary and save it here for this device.</div>';
      emitMotion('saved-trips-rendered');
      return;
    }
    container.innerHTML = state.savedTrips.map((trip) => {
      const count = (trip.stops || []).length;
      const date = trip.date ? new Date(`${trip.date}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date not set';
      return `<article class="saved-trip" data-trip-id="${escapeHTML(trip.id)}"><h3>${escapeHTML(trip.title || `${count} stops near Mangaluru`)}</h3><p>${escapeHTML(date)} · ${count} stops · ${escapeHTML(MODE_NAMES[trip.mode] || 'Travel mode not set')}</p><div class="saved-trip-actions"><button data-action="load-trip">Open this day</button><button data-action="share-saved">Share</button><button data-action="delete-trip">Remove</button></div></article>`;
    }).join('');
    emitMotion('saved-trips-rendered');
  }

  function openSavedDrawer() {
    renderSavedTrips();
    ui.drawer.inert = false;
    ui.drawer.classList.add('open');
    ui.drawer.setAttribute('aria-hidden', 'false');
    ui.drawerShade.hidden = false;
    emitMotion('drawer-opened');
    document.body.classList.add('drawer-open');
    $('#saved-close').focus();
  }

  function closeSavedDrawer() {
    ui.drawer.classList.remove('open');
    ui.drawer.setAttribute('aria-hidden', 'true');
    ui.drawer.inert = true;
    ui.drawerShade.hidden = true;
    emitMotion('drawer-closed');
    document.body.classList.remove('drawer-open');
    $('#saved-open').focus();
  }

  function parseSharedTrip() {
    const value = new URLSearchParams(window.location.search).get('trip');
    if (!value) return;
    try {
      const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(escape(atob(normalized)));
      loadTrip(JSON.parse(json));
    } catch {
      toast('This shared itinerary link could not be read.');
    }
  }

  function todayLocal() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  function bindEvents() {
    ui.search.addEventListener('input', () => { state.search = ui.search.value; state.visibleLimit = 9; renderCards(); });
    $('#search-submit').addEventListener('click', () => { state.search = ui.search.value; renderCards(); $('#discover').scrollIntoView({ behavior: 'smooth' }); });
    ui.filterTabs.addEventListener('click', (event) => {
      const button = event.target.closest('.filter-tab');
      if (!button) return;
      state.category = button.dataset.category;
      state.visibleLimit = 9;
      renderCards();
    });
    ui.sort.addEventListener('change', () => { state.sort = ui.sort.value; renderCards(); });
    $('#clear-filters').addEventListener('click', () => { state.search = ''; ui.search.value = ''; state.category = 'All'; renderCards(); });
    ui.showAll.addEventListener('click', () => { state.visibleLimit = state.visibleLimit > 9 ? 9 : state.destinations.length; renderCards(); });

    ui.grid.addEventListener('click', (event) => {
      const card = event.target.closest('.destination-card');
      if (!card) return;
      const destination = getDestination(card.dataset.id);
      if (!destination) return;
      const action = event.target.closest('[data-action]')?.dataset.action;
      if (action === 'add') return addDestination(destination.id);
      if (action === 'favorite') {
        if (state.favorites.has(destination.id)) state.favorites.delete(destination.id);
        else state.favorites.add(destination.id);
        safeWrite('router-favorites', [...state.favorites]);
        renderCards();
        return;
      }
      renderModal(destination);
    });
    ui.grid.addEventListener('keydown', (event) => {
      if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.destination-card')) {
        event.preventDefault();
        const destination = getDestination(event.target.dataset.id);
        if (destination) renderModal(destination);
      }
    });

    ui.selectedList.addEventListener('click', (event) => {
      const button = event.target.closest('[data-action]');
      if (!button) return;
      const stop = button.closest('.selected-stop');
      const index = state.selected.indexOf(stop?.dataset.id);
      if (index < 0) return;
      if (button.dataset.action === 'remove') state.selected.splice(index, 1);
      if (button.dataset.action === 'up' && index > 0) [state.selected[index - 1], state.selected[index]] = [state.selected[index], state.selected[index - 1]];
      if (button.dataset.action === 'down' && index < state.selected.length - 1) [state.selected[index + 1], state.selected[index]] = [state.selected[index], state.selected[index + 1]];
      markRouteDirty();
    });

    ui.generate.addEventListener('click', generateRoute);
    $('#save-itinerary').addEventListener('click', saveTrip);
    $('#share-trip').addEventListener('click', shareTrip);
    $('#share-top').addEventListener('click', shareTrip);
    [ui.start, ui.mode].forEach((control) => control.addEventListener('change', () => { if (state.selected.length) markRouteDirty(); }));
    ui.hours.addEventListener('change', () => { if (state.isGenerated) renderMap(); });
    $('#map-plan-link').addEventListener('click', () => $('#planner').scrollIntoView({ behavior: 'smooth' }));
    $('#route-nearby-list').addEventListener('click', (event) => {
      const button = event.target.closest('[data-nearby-id]');
      if (button) addDestination(button.dataset.nearbyId);
    });

    $('#modal-add').addEventListener('click', () => {
      if (state.activeDestination) addDestination(state.activeDestination.id);
      closeModal(false);
      ui.generate.focus();
      $('#planner').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    $('#modal-close').addEventListener('click', closeModal);
    ui.modalBackdrop.addEventListener('click', (event) => { if (event.target === ui.modalBackdrop) closeModal(); });
    document.addEventListener('keydown', (event) => {
      if (!ui.modalBackdrop.hidden) trapDialogFocus($('#destination-modal'), event);
      else if (ui.drawer.classList.contains('open')) trapDialogFocus(ui.drawer, event);
      if (event.key === 'Escape') {
        if (!ui.modalBackdrop.hidden) closeModal();
        else if (ui.drawer.classList.contains('open')) closeSavedDrawer();
      }
    });

    $('#saved-open').addEventListener('click', openSavedDrawer);
    $('#saved-close').addEventListener('click', closeSavedDrawer);
    ui.drawerShade.addEventListener('click', closeSavedDrawer);
    $('#saved-list').addEventListener('click', async (event) => {
      const button = event.target.closest('[data-action]');
      if (!button) return;
      const card = button.closest('.saved-trip');
      const trip = state.savedTrips.find((item) => item.id === card?.dataset.tripId);
      if (!trip) return;
      if (button.dataset.action === 'delete-trip') {
        state.savedTrips = state.savedTrips.filter((item) => item.id !== trip.id);
        safeWrite('router-saved-trips', state.savedTrips);
        renderSavedTrips();
        toast('Saved day removed.');
      } else if (button.dataset.action === 'load-trip') {
        loadTrip(trip);
        closeSavedDrawer();
        $('#planner').scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (button.dataset.action === 'share-saved') {
        try { await copyText(tripUrl(trip)); toast('A shareable itinerary link is copied.'); }
        catch { toast('Could not copy that itinerary link.'); }
      }
    });
  }

  async function init() {
    $('#current-year').textContent = new Date().getFullYear();
    ui.date.min = todayLocal();
    ui.date.value = todayLocal();
    bindEvents();
    renderSavedTrips();
    try {
      const response = await fetch('/api/destinations', { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Destination request failed');
      const destinations = await response.json();
      state.destinations = Array.isArray(destinations) ? destinations : [];
    } catch {
      ui.grid.innerHTML = '<div class="data-error">Places are taking a moment to load. Refresh to try again.</div>';
      toast('Could not load destination data.');
      return;
    }
    renderCards();
    renderSelection();
    renderMap();
    parseSharedTrip();
  }

  init();
})();
