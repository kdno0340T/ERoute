import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { Observer } from "gsap/Observer";
import { useGSAP } from "@gsap/react";

// Register all GSAP plugins once (per gsap-skills plugin skill).
// Every plugin is free — no Club GSAP membership or auth token required.
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText, Flip, Observer);

// Shared project-wide defaults (per gsap-core skill).
gsap.defaults({ ease: "power3.out", duration: 0.75 });

export { gsap, ScrollTrigger, ScrollToPlugin, SplitText, Flip, Observer, useGSAP };
