import { gsap, ScrollTrigger, ScrollToPlugin, SplitText } from "./gsap";

const captions = ["A little salt air to begin.", "Take the quieter way through.", "Leave room for the last light."];
const markerOptions = () => new URLSearchParams(window.location.search).has("motionDebug")
  ? { startColor: "#49765e", endColor: "#c35442", fontSize: "9px", indent: 10 }
  : false;

function splitReveal(element, { trigger = element, start = "top 82%", immediate = false } = {}) {
  if (!element) return;
  return SplitText.create(element, {
    type: "lines",
    mask: "lines",
    autoSplit: true,
    aria: "auto",
    onSplit(self) {
      const lines = Array.from(self.lines);
      if (!lines.length) return;
      return gsap.from(lines, {
        yPercent: 108,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.075,
        delay: immediate ? 0.14 : 0,
        ease: "power3.out",
        scrollTrigger: immediate ? undefined : { trigger, start, once: true, markers: markerOptions() },
      });
    },
  });
}

function reveal(elements, options = {}) {
  const nodes = gsap.utils.toArray(elements);
  if (!nodes.length) return;
  nodes.forEach((node, index) => gsap.fromTo(node, { y: 28, autoAlpha: 0 }, {
    y: 0, autoAlpha: 1, duration: 0.8, delay: index * (options.stagger ?? 0.1),
    ease: "power3.out", clearProps: "transform,opacity,visibility",
    scrollTrigger: { trigger: options.trigger || node.closest("section,footer") || node, start: options.start || "top 84%", once: true, markers: markerOptions() },
  }));
}

function storyMotion(root, mobile = false) {
  const track = root.querySelector("#story-scroll-track");
  const scenes = gsap.utils.toArray(".story-scene", root);
  if (!track || scenes.length < 2) return;
  const links = scenes.map((scene) => scene.querySelector("a"));
  const context = gsap.context(() => {
    gsap.set(Array.from(scenes), { autoAlpha: 0, xPercent: 0, scale: 0.97, rotate: 0.5 });
    gsap.set(scenes[0], { autoAlpha: 1, scale: 1, rotate: 0 });
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: track, start: "top top",
        end: () => `+=${Math.max(1, track.scrollHeight - window.innerHeight)}`,
        scrub: 0.8, invalidateOnRefresh: true,
        markers: markerOptions(), onUpdate(self) {
          const index = Math.min(2, Math.floor(self.progress * 3));
          scenes.forEach((scene, i) => scene.setAttribute("aria-hidden", String(i !== index)));
          links.forEach((link, i) => link?.setAttribute("tabindex", i === index ? "0" : "-1"));
          const fill = root.querySelector("#story-progress-fill");
          const progress = root.querySelector(".story-progress");
          if (fill) gsap.set(fill, { scaleX: self.progress });
          if (progress) progress.setAttribute("aria-valuenow", String(Math.round(self.progress * 100)));
          const step = root.querySelector("#story-step");
          const caption = root.querySelector("#story-caption");
          if (step) step.textContent = `0${index + 1} / 03`;
          if (caption) caption.textContent = captions[index];
        },
      },
    });
    scenes.forEach((scene, index) => {
      const next = scenes[index + 1];
      const photo = scene.querySelector(".scene-photo");
      const shade = scene.querySelector(".scene-shade");
      const copy = scene.querySelector(".scene-copy");
      if (photo) timeline.to(photo, { scale: 1.12, yPercent: -1, ease: "none", duration: 1 }, index);
      if (shade) timeline.to(shade, { yPercent: 10, ease: "none", duration: 1 }, index);
      if (copy) timeline.fromTo(copy, { y: 24, autoAlpha: 0.6 }, { y: 0, autoAlpha: 1, duration: 1, ease: "none" }, index);
      if (!next) return;
      const at = index + 0.78;
      timeline.to(scene, { autoAlpha: 0, scale: 0.97, rotate: -0.5, duration: 0.42, ease: "power2.inOut" }, at)
        .fromTo(next, { autoAlpha: 0, scale: 0.97, rotate: 0.5 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.55, ease: "power2.inOut", immediateRender: false }, at + 0.27);
    });
  }, track);
  const refreshOnResize = () => ScrollTrigger.refresh();
  window.addEventListener("resize", refreshOnResize, { passive: true });
  return () => {
    window.removeEventListener("resize", refreshOnResize);
    context.revert();
  };
}

function initialize(root, mobile = false) {
  if (!mobile) {
    [root.querySelector(".story-instruction b")].filter(Boolean).forEach((cue) => {
      gsap.to(cue, { y: 4, duration: 1.35, ease: "sine.inOut", repeat: -1, yoyo: true });
    });
  }
  const cleanupStoryMotion = storyMotion(root, mobile);

  ["#discover-title", "#seasonal-title", "#map-title", ".local-note > p", ".footer-top > p"].forEach((selector) => {
    splitReveal(root.querySelector(selector));
  });
  reveal(root.querySelectorAll(".section-heading-side, .discovery-toolbar, .discovery-tools, .planner-card, .planner-heading, .map-heading-copy, .map-card, .seasonal-content > :not(#seasonal-title), .seasonal-graphic, .local-note > :not(p), .site-footer > *"), { stagger: 0.09 });
  // Monument.tv-style unified scrub parallax — multiple layers at different speeds
  if (!mobile) {
    const parallaxTl = gsap.timeline({
      scrollTrigger: {
        trigger: root.querySelector("main"),
        start: "top bottom",
        end: "bottom bottom",
        scrub: true,
        ease: "none",
        markers: markerOptions(),
      },
    });
    // Imagery layers — different speeds per layer
    parallaxTl.to(".seasonal-image", { yPercent: [-22, 22], ease: "none" }, 0);
    parallaxTl.to(".map-canvas", { yPercent: [-22, 22], ease: "none" }, 0);
    parallaxTl.to(".map-card", { yPercent: [-22, 22], ease: "none" }, 0);
    // Batch 3 seasonal-graphic layers — slower to fastest
    parallaxTl.to(".sun-ring", { yPercent: [-16, 16], ease: "none" }, 0);
    parallaxTl.to(".seasonal-wave.wave-one", { yPercent: [-26, 26], ease: "none" }, 0);
    parallaxTl.to(".seasonal-wave.wave-two", { yPercent: [-36, 36], ease: "none" }, 0);
  }

  // Batch 5: Masked reveal for existing CTA text (outside story section)
  const showAllBtn = root.querySelector("#show-all");
  if (showAllBtn) {
    SplitText.create(showAllBtn, {
      type: "chars",
      mask: "chars",
      aria: "auto",
      onSplit(self) {
        const chars = Array.from(self.chars);
        if (!chars.length) return;
        gsap.from(chars, {
          autoAlpha: 0,
          y: 10,
          duration: 0.5,
          stagger: 0.02,
          ease: "power3.out",
          scrollTrigger: {
            trigger: showAllBtn,
            start: "top 85%",
            once: true,
            markers: markerOptions(),
          },
        });
      },
    });
  }

  // Batch 5: Calm footer fade-up (opacity only, no layout shift)
  const footer = root.querySelector("footer.site-footer");
  if (footer) {
    gsap.fromTo(footer, { autoAlpha: 0 }, {
      autoAlpha: 1,
      duration: 1.4,
      ease: "power2.out",
      scrollTrigger: {
        trigger: footer,
        start: "top 85%",
        once: true,
        markers: markerOptions(),
      },
    });
  }

  const progress = root.querySelector("#page-progress span");
  if (progress) gsap.to(progress, { scaleX: 1, ease: "none", scrollTrigger: { trigger: root.querySelector("main"), start: "top top", end: "bottom bottom", scrub: 0.2, markers: markerOptions() } });

  const counterEl = root.querySelector("#section-counter");
  const counterCurrent = root.querySelector("#section-counter-current");
  const counterTotal = root.querySelector("#section-counter-total");
  const tracked = [
    { sel: ".hero", num: 1 },
    { sel: "#discover", num: 2 },
    { sel: ".seasonal-band", num: 3 },
    { sel: "#map-section", num: 4 },
    { sel: ".local-note", num: 5 },
    { sel: "footer.site-footer", num: 6 },
  ];
  const total = tracked.length;
  if (counterTotal) counterTotal.textContent = String(total).padStart(2, "0");
  let currentNum = 0;
  function setCounter(num) {
    if (num === currentNum || !counterCurrent) return;
    currentNum = num;
    counterCurrent.textContent = String(num).padStart(2, "0");
  }
  tracked.forEach(({ sel, num }) => {
    const el = root.querySelector(sel);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el, start: "top 55%", once: true,
      onEnter: () => setCounter(num),
    });
  });
  // Subtle scrubbed section transitions — opacity only, desktop
  if (!mobile) {
    ["#discover", ".seasonal-band", "#map-section", ".local-note", "footer.site-footer"].forEach((sel) => {
      const el = root.querySelector(sel);
      if (el) gsap.fromTo(el, { autoAlpha: 0.82 }, { autoAlpha: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 60%", end: "bottom 40%", scrub: 0.5, markers: markerOptions() } });
    });
  }

  root.querySelectorAll(".main-nav a[href^='#']").forEach((link) => {
    const target = root.querySelector(link.getAttribute("href"));
    if (!target) return;
    ScrollTrigger.create({ trigger: target, start: "top 45%", end: "bottom 45%", markers: markerOptions(), onToggle: (self) => link.classList.toggle("active", self.isActive) });
  });

  let cardsContext;
  const animateCards = () => {
    cardsContext?.revert();
    const grid = root.querySelector("#destination-grid");
    if (!grid) return;
    cardsContext = gsap.context(() => {
      const cards = grid.querySelectorAll(".destination-card");
      if (cards.length) gsap.fromTo(Array.from(cards), { y: 34, autoAlpha: 0, scale: 0.985 }, { y: 0, autoAlpha: 1, scale: 1, duration: 0.8, stagger: 0.075, ease: "power3.out", clearProps: "transform,opacity,visibility", scrollTrigger: { trigger: grid, start: "top 88%", once: true, markers: markerOptions() } });
      const counter = root.querySelector("#results-count");
      if (counter && cards.length) {
        counter.textContent = String(cards.length);
        gsap.fromTo(counter, { autoAlpha: 0, y: 10, scale: 0.92 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out" });
      }
      cards.forEach((card) => {
        const image = card.querySelector(".card-image");
        // Card-level hover + image scale (restrained, power3 easing)
        card.addEventListener("pointerenter", () => gsap.to(card, { y: -6, rotate: -0.25, duration: 0.32, ease: "power3.out", overwrite: true }));
        card.addEventListener("pointerleave", () => gsap.to(card, { y: 0, rotate: 0, duration: 0.4, ease: "power3.out", overwrite: true }));
        card.addEventListener("pointerenter", () => gsap.to(image, { scale: 1.04, duration: 0.55, ease: "power3.out" }));
        card.addEventListener("pointerleave", () => gsap.to(image, { scale: 1, duration: 0.65, ease: "power3.out" }));
        // Card image scrub parallax — subtle, only on desktop
        if (!mobile) {
          gsap.to(image, {
            yPercent: [-6, 6],
            ease: "none",
            scrollTrigger: {
              trigger: image,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              markers: markerOptions(),
            },
          });
        }
      });
    }, grid);
  };
  root.addEventListener("router:cards-rendered", animateCards);
  animateCards();

  let selectionContext;
  const animateSelection = () => {
    selectionContext?.revert();
    const list = root.querySelector("#selected-list");
    if (!list) return;
    selectionContext = gsap.context(() => reveal(list.querySelectorAll(".selected-stop"), { stagger: 0.08 }), list);
  };
  root.addEventListener("router:selection-rendered", animateSelection);
  animateSelection();

  let mapContext;
  const animateMap = () => {
    mapContext?.revert();
    const layer = root.querySelector("#route-layer");
    if (!layer) return;
    mapContext = gsap.context(() => {
      const stops = layer.querySelectorAll(".map-stop, .map-label-stop");
      if (stops.length) gsap.from(Array.from(stops), { scale: 0.65, autoAlpha: 0, transformOrigin: "center", duration: 0.5, stagger: 0.12, ease: "back.out(1.5)" });
      const route = layer.querySelector(".map-route-line");
      if (route) gsap.fromTo(route, { autoAlpha: 0, scale: 0.97, transformOrigin: "left center" }, { autoAlpha: 1, scale: 1, duration: 0.8, ease: "power2.inOut" });
    }, layer);
  };
  root.addEventListener("router:map-rendered", animateMap);
  animateMap();

  let savedContext;
  const animateSaved = () => {
    savedContext?.revert();
    const list = root.querySelector("#saved-list");
    if (!list) return;
    savedContext = gsap.context(() => reveal(list.querySelectorAll(".saved-trip"), { stagger: 0.1 }), list);
  };
  root.addEventListener("router:saved-trips-rendered", animateSaved);
  animateSaved();

  const animateOverlay = (element, opened) => {
    if (!element) return;
    gsap.killTweensOf(element);
    gsap.to(element, { autoAlpha: opened ? 1 : 0, y: opened ? 0 : 12, scale: opened ? 1 : 0.985, duration: opened ? 0.42 : 0.25, ease: opened ? "power3.out" : "power2.inOut", onComplete: () => { if (!opened) element.style.visibility = ""; } });
  };
  const onModalOpen = () => animateOverlay(root.querySelector("#destination-modal"), true);
  const onModalClose = () => animateOverlay(root.querySelector("#destination-modal"), false);
  const onDrawerOpen = () => gsap.fromTo(root.querySelector("#saved-drawer"), { xPercent: 100, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 0.55, ease: "power3.out" });
  const onDrawerClose = () => gsap.to(root.querySelector("#saved-drawer"), { xPercent: 100, autoAlpha: 0, duration: 0.35, ease: "power2.inOut" });
  const onToast = () => gsap.fromTo(root.querySelector("#toast"), { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.35, ease: "power3.out" });
  root.addEventListener("router:modal-opened", onModalOpen);
  root.addEventListener("router:modal-closed", onModalClose);
  root.addEventListener("router:drawer-opened", onDrawerOpen);
  root.addEventListener("router:drawer-closed", onDrawerClose);
  root.addEventListener("router:toast", onToast);

  const onModalEnter = () => gsap.fromTo(root.querySelector("#modal-backdrop"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "power2.out" });
  root.addEventListener("router:modal-opened", onModalEnter);

  const interactiveSelector = ".primary-button,.search-submit,.outline-button,.text-link,.scene-link,.icon-button,.avatar-button,.modal-close,.filter-tab,.card-bookmark,.add-place,.stop-tool,.saved-trip-actions button,.footer-top-link";
  const setInteractiveState = (event, active) => {
    const target = event.target.closest(interactiveSelector);
    if (!target || target.classList.contains("magnetic")) return;
    if (event.relatedTarget && target.contains(event.relatedTarget)) return;
    gsap.to(target, { y: active ? -2 : 0, scale: active ? 1.025 : 1, rotation: target.classList.contains("modal-close") && active ? 90 : 0, duration: active ? 0.22 : 0.3, ease: "power3.out", overwrite: true });
  };
  const onInteractiveOver = (event) => setInteractiveState(event, true);
  const onInteractiveOut = (event) => setInteractiveState(event, false);
  const onFocusIn = (event) => setInteractiveState(event, true);
  const onFocusOut = (event) => setInteractiveState(event, false);
  root.addEventListener("pointerover", onInteractiveOver);
  root.addEventListener("pointerout", onInteractiveOut);
  root.addEventListener("focusin", onFocusIn);
  root.addEventListener("focusout", onFocusOut);

  const magneticTargets = new Map();
  const onMagneticMove = (event) => {
    const target = event.target.closest(".magnetic");
    if (!target) return;
    const rect = target.getBoundingClientRect();
    gsap.to(target, { x: (event.clientX - rect.left - rect.width / 2) * 0.08, y: (event.clientY - rect.top - rect.height / 2) * 0.1, duration: 0.35, ease: "power3.out", overwrite: true });
    magneticTargets.set(target, true);
  };
  const onMagneticLeave = (event) => {
    const target = event.target.closest(".magnetic");
    if (!target || (event.relatedTarget && target.contains(event.relatedTarget)) || !magneticTargets.has(target)) return;
    gsap.to(target, { x: 0, y: 0, duration: 0.45, ease: "power3.out", overwrite: true });
    magneticTargets.delete(target);
  };
  if (!mobile) {
    root.addEventListener("pointermove", onMagneticMove, { passive: true });
    root.addEventListener("pointerout", onMagneticLeave);
  }

  const cursor = root.querySelector("#cursor-follower");
  const cursorOrb = cursor?.querySelector(".cursor-orb");
  const cursorLabel = cursor?.querySelector(".cursor-label");
  let pointerMove;
  if (cursor && matchMedia("(pointer:fine)").matches && !mobile && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.classList.add("has-fine-pointer");
    // Monument.tv-style tight cursor tracking — xPercent/yPercent center the orb on the mouse
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.12, ease: "power2.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.12, ease: "power2.out" });
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    pointerMove = (event) => { xTo(event.clientX); yTo(event.clientY); };
    window.addEventListener("pointermove", pointerMove, { passive: true });
    // Hover states on interactive elements
    root.addEventListener("pointerover", (event) => {
      const target = event.target.closest("a,button,.destination-card");
      if (!target) return;
      const label = target.dataset.cursorLabel || (target.matches(".destination-card") ? "OPEN PLACE" : "EXPLORE");
      if (cursorLabel) cursorLabel.textContent = label;
      cursor.classList.add("is-active");
      if (cursorOrb) gsap.to(cursorOrb, { scale: 1.9, duration: 0.18, ease: "power2.out" });
    });
    root.addEventListener("pointerout", (event) => {
      if (event.target.closest("a,button,.destination-card")) {
        cursor.classList.remove("is-active");
        if (cursorOrb) gsap.to(cursorOrb, { scale: 1, duration: 0.22, ease: "power2.out" });
      }
    });
    // Pressed state
    window.addEventListener("mousedown", () => {
      if (cursorOrb) gsap.to(cursorOrb, { scale: 0.55, duration: 0.08, ease: "power2.out" });
    });
    window.addEventListener("mouseup", () => {
      if (cursorOrb) gsap.to(cursorOrb, { scale: 1, duration: 0.15, ease: "power2.out" });
    });
  }

  const clickAnchors = (event) => {
    const link = event.target.closest("a[href^='#']");
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = root.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    gsap.to(window, { duration: 0.9, ease: "power2.inOut", scrollTo: { y: target, offsetY: 76, autoKill: true } });
  };
  root.addEventListener("click", clickAnchors);
  ScrollTrigger.refresh();

  return () => {
    document.documentElement.classList.remove("has-fine-pointer");
    cleanupStoryMotion?.();
    cardsContext?.revert(); selectionContext?.revert(); mapContext?.revert(); savedContext?.revert();
    root.removeEventListener("router:cards-rendered", animateCards);
    root.removeEventListener("router:selection-rendered", animateSelection);
    root.removeEventListener("router:map-rendered", animateMap);
    root.removeEventListener("router:saved-trips-rendered", animateSaved);
    root.removeEventListener("router:modal-opened", onModalOpen);
    root.removeEventListener("router:modal-closed", onModalClose);
    root.removeEventListener("router:drawer-opened", onDrawerOpen);
    root.removeEventListener("router:drawer-closed", onDrawerClose);
    root.removeEventListener("router:toast", onToast);
    root.removeEventListener("router:modal-opened", onModalEnter);
    root.removeEventListener("pointerover", onInteractiveOver);
    root.removeEventListener("pointerout", onInteractiveOut);
    root.removeEventListener("focusin", onFocusIn);
    root.removeEventListener("focusout", onFocusOut);
    root.removeEventListener("pointermove", onMagneticMove);
    root.removeEventListener("pointerout", onMagneticLeave);
    root.removeEventListener("click", clickAnchors);
    if (pointerMove) window.removeEventListener("pointermove", pointerMove);
  };
}

export function mountSiteMotion(root) {
  const media = gsap.matchMedia();
  let cleanup = () => {};
  const context = gsap.context(() => {
    media.add("(prefers-reduced-motion: no-preference) and (min-width: 761px)", () => { cleanup = initialize(root, false); return cleanup; });
    media.add("(prefers-reduced-motion: no-preference) and (max-width: 760px)", () => { cleanup = initialize(root, true); return cleanup; });
    media.add("(prefers-reduced-motion: reduce)", () => {
      const scenes = Array.from(root.querySelectorAll(".story-scene"));
      const content = Array.from(root.querySelectorAll(".destination-card,.selected-stop,.map-stop,.map-label-stop,.saved-trip"));
      if (scenes.length) gsap.set(scenes, { clearProps: "all", autoAlpha: 1, x: 0, y: 0, scale: 1, rotate: 0 });
      scenes.forEach((scene) => scene.setAttribute("aria-hidden", "false"));
      root.querySelectorAll(".story-scene a").forEach((link) => link.setAttribute("tabindex", "0"));
      if (content.length) gsap.set(content, { clearProps: "all", autoAlpha: 1, x: 0, y: 0, scale: 1 });
    });
  }, root);
  return () => { cleanup(); media.revert(); context.revert(); ScrollTrigger.refresh(); };
}
