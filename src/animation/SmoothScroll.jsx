import { useLayoutEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger } from "./gsap";

let activeScroll;

// Route links and showcase controls use the same driver as wheel scrolling.
export function scrollToPosition(top, { immediate = false, duration = .65 } = {}) {
  if (activeScroll) {
    activeScroll.resize();
    activeScroll.scrollTo(top, { immediate, duration });
  } else {
    window.scrollTo({ top, behavior: immediate || window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
}

export default function SmoothScroll() {
  useLayoutEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let teardown = () => {};
    const configure = () => {
      teardown();
      if (preference.matches) return;
      const lenis = new Lenis({
        autoRaf: false,
        lerp: .14,
        smoothWheel: true,
        syncTouch: false,
        prevent: (node) => node.matches("[data-lenis-prevent], [role='dialog'], .card-section, iframe, textarea, select"),
      });
      activeScroll = lenis;
      const tick = (seconds) => lenis.raf(seconds * 1000);
      const resize = () => lenis.resize();
      lenis.on("scroll", ScrollTrigger.update);
      ScrollTrigger.addEventListener("refresh", resize);
      gsap.ticker.lagSmoothing(0);
      gsap.ticker.add(tick);
      teardown = () => {
        gsap.ticker.remove(tick);
        ScrollTrigger.removeEventListener("refresh", resize);
        lenis.destroy();
        activeScroll = undefined;
        teardown = () => {};
      };
    };
    configure();
    preference.addEventListener("change", configure);
    return () => {
      preference.removeEventListener("change", configure);
      teardown();
    };
  }, []);
  return null;
}
