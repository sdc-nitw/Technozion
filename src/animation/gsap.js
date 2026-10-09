import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { SplitText } from "gsap/dist/SplitText";
import { ScrollToPlugin } from "gsap/dist/ScrollToPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, ScrollToPlugin, useGSAP);
export { gsap, ScrollTrigger, SplitText, useGSAP };
export const motionConditions = {
  all: "(min-width: 0px)",
  desktop: "(min-width: 1024px) and (min-height: 700px)",
  reduce: "(prefers-reduced-motion: reduce)",
};

export function observeSceneMeasurements(element) {
  let disposed = false;
  let frame;
  const refresh = () => {
    if (disposed) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => { if (!disposed) ScrollTrigger.refresh(); });
  };
  const images = [...element.querySelectorAll("img")];
  images.forEach(image => {
    image.addEventListener("load", refresh);
    image.addEventListener("error", refresh);
  });
  document.fonts?.ready.then(refresh);
  refresh();
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    images.forEach(image => {
      image.removeEventListener("load", refresh);
      image.removeEventListener("error", refresh);
    });
  };
}
