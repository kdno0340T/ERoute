import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

// Register GSAP plugins once (client-side only).
// Only the plugins actually used in Phase 1A: gsap core, ScrollTrigger, SplitText.
gsap.registerPlugin(ScrollTrigger, SplitText);

// Shared project-wide defaults (per GSAP motion rules: power3.out, 0.8–1.2s).
gsap.defaults({ ease: "power3.out", duration: 0.8 });

export { gsap, ScrollTrigger, SplitText };
