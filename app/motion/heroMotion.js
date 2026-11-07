import { gsap, ScrollTrigger, SplitText } from "./gsap";

/** Intro and scroll motion for the Hero and its site navigation only. */
export function mountHeroMotion(root, preloader) {
  const hero = root.querySelector(".hero");
  const title = hero?.querySelector("#hero-title");
  const photo = hero?.querySelector(".hero-photo");
  const header = root.querySelector(".site-header");
  const cue = hero?.querySelector(".hero-bottom-note");
  const counter = preloader?.querySelector("span");
  if (!hero || !title || !photo || !header || !preloader || !counter) return () => {};

  const media = gsap.matchMedia();
  const context = gsap.context(() => {
    media.add({
      reduced: "(prefers-reduced-motion: reduce)",
      desktop: "(prefers-reduced-motion: no-preference) and (min-width: 761px)",
      mobile: "(prefers-reduced-motion: no-preference) and (max-width: 760px)",
    }, ({ conditions }) => {
      if (conditions.reduced) {
        gsap.set([title, photo, header], { clearProps: "opacity,visibility,transform" });
        gsap.set(preloader, { autoAlpha: 0 });
        return;
      }

      const split = SplitText.create(title, { type: "lines", mask: "lines", aria: "auto" });
      gsap.set(title, { clearProps: "opacity" });
      gsap.set(split.lines, { yPercent: 110, autoAlpha: 0 });

      const count = { value: 0 };
      const intro = gsap.timeline({
        defaults: { ease: "power3.out", duration: 0.9 },
        onComplete: () => ScrollTrigger.refresh(),
      });
      intro.to(count, {
        value: 100,
        duration: 0.95,
        ease: "none",
        snap: "value",
        onUpdate: () => { counter.textContent = `${count.value}%`; },
      })
        .to(preloader, { autoAlpha: 0, duration: 0.55, ease: "power2.inOut" }, ">-0.04")
        .to(split.lines, { yPercent: 0, autoAlpha: 1, stagger: 0.12 }, ">-0.02")
        .fromTo(photo, { scale: 1.12, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.05 }, "<0.08")
        .fromTo(header, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9 }, "<0.12");

      const parallax = gsap.to(photo, {
        yPercent: conditions.mobile ? 5 : 10,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      const cueFade = cue && gsap.to(cue, {
        autoAlpha: 0,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "+=90", scrub: true },
      });

      return () => {
        intro.kill();
        parallax.scrollTrigger?.kill();
        cueFade?.scrollTrigger?.kill();
        split.revert();
      };
    });
  }, root);

  ScrollTrigger.refresh();
  return () => {
    media.revert();
    context.revert();
    ScrollTrigger.refresh();
  };
}
