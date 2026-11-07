# Cline Project Instructions — RoutER (GSAP Animation)

## Loaded Skills (from gsap-skills repo)
When working on animation, scroll, or motion tasks in this project, Cline MUST consult and follow the official GSAP AI skills:

- **gsap-core** — `../gsap-skills/skills/gsap-core/SKILL.md` — Core tweens, easing, stagger, matchMedia, reduced-motion
- **gsap-timeline** — `../gsap-skills/skills/gsap-timeline/SKILL.md` — Timeline sequencing, position parameter
- **gsap-scrolltrigger** — `../gsap-skills/skills/gsap-scrolltrigger/SKILL.md` — ScrollTrigger, pinning, scrub, cleanup
- **gsap-plugins** — `../gsap-skills/skills/gsap-plugins/SKILL.md` — SplitText, Flip, Observer, ScrollToPlugin
- **gsap-utils** — `../gsap-skills/skills/gsap-utils/SKILL.md` — clamp, mapRange, normalize, quickTo, snap, wrap
- **gsap-performance** — `../gsap-skills/skills/gsap-performance/SKILL.md` — transforms, will-change, batching
- **gsap-react** — `../gsap-skills/skills/gsap-react/SKILL.md` — useGSAP, context, SSR safety

## Project Animation Rules
1. **Transform/opacity only** — never animate `width`, `height`, `top`, `left` for movement
2. **gsap.context() + revert()** — all motion scoped and cleaned up to prevent leaks
3. **gsap.matchMedia()** — responsive breakpoints + `prefers-reduced-motion` support
4. **ScrollTrigger on timeline/top-level only** — never on child tweens
5. **Lenis + scrollerProxy** — smooth scroll with ScrollTrigger sync via `ScrollTrigger.update()`
6. **No animation on story-reel pinned section** — protected by user constraint
7. **Mobile-first** — skip parallax/scrub on mobile (`max-width: 760px`)
8. **Build must pass** — `npm run build` must succeed after any motion change