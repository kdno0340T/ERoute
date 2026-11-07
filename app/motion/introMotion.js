import { gsap, ScrollTrigger, SplitText } from "./gsap";

/** Intro-strip scroll reveal.
 * 1. First paragraph — SplitText line reveal (yPercent 110 -> 0, staggered).
 * 2. Copy paragraph — fade-up (y 28 -> 0, autoAlpha 0 -> 1).
 * 3. Link — fade-up, staggered shortly after the copy.
 * transform/opacity only; respects prefers-reduced-motion.
 */
export function mountIntroMotion(root) {
  const strip = root.querySelector(".intro-strip");
  if (!strip) return () => {};

  const firstP = strip.querySelector(":scope > p:first-of-type");
  const copyP = strip.querySelector(".intro-strip-copy");
  const link = strip.querySelector(".text-link");
  if (!firstP && !copyP && !link) return () => {};

  let splitInstance = null;

  const media = gsap.matchMedia();
  const context = gsap.context(() => {
    media.add(
      {
        reduced: "(prefers-reduced-motion: reduce)",
        ok: "(prefers-reduced-motion: no-preference)",
      },
      ({ conditions }) => {
        // Revert previous split before any re-run.
        if (splitInstance) {
          splitInstance.revert();
          splitInstance = null;
        }

        if (conditions.reduced) {
          gsap.set([firstP, copyP, link].filter(Boolean), {
            clearProps: "transform,opacity,visibility",
            autoAlpha: 1,
          });
          return;
        }

        // Initial states — no flash before the scroll-triggered reveal.
        gsap.set([copyP, link].filter(Boolean), { y: 28, autoAlpha: 0 });

        const scroll = { trigger: strip, start: "top 82%", once: true };

        // 1) First paragraph — SplitText line reveal.
        if (firstP && SplitText) {
          splitInstance = SplitText.create(firstP, {
            type: "lines",
            mask: "lines",
            aria: "auto",
          });
          gsap.set(firstP, { clearProps: "opacity" });
          gsap.set(splitInstance.lines, { yPercent: 110, autoAlpha: 0 });
          gsap.to(splitInstance.lines, {
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.9,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: scroll,
          });
        }

        // 2) Copy paragraph fade-up.
        if (copyP) {
          gsap.fromTo(copyP, { y: 28, autoAlpha: 0 }, {
            y: 0,
            autoAlpha: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: scroll,
          });
        }

        // 3) Link fade-up, staggered slightly after the copy.
        if (link) {
          gsap.fromTo(link, { y: 28, autoAlpha: 0 }, {
            y: 0,
            autoAlpha: 1,
            duration: 0.9,
            ease: "power3.out",
            delay: 0.12,
            scrollTrigger: scroll,
          });
        }
      }
    );
  }, root);

  ScrollTrigger.refresh();
  return () => {
    if (splitInstance) splitInstance.revert();
    media.revert();
    context.revert();
    ScrollTrigger.refresh();
  };
}
