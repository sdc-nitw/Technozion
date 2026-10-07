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

let measurementTimer;
let waitingForScroll = false;
const refreshMeasurements = () => {
  if (ScrollTrigger.isScrolling()) {
    if (!waitingForScroll) {
      waitingForScroll = true;
      ScrollTrigger.addEventListener("scrollEnd", refreshMeasurements);
    }
    return;
  }
  ScrollTrigger.removeEventListener("scrollEnd", refreshMeasurements);
  waitingForScroll = false;
  const focused = document.activeElement;
  ScrollTrigger.refresh();
  // Pin refreshes temporarily reparent scenes; retain keyboard focus on their links.
  if (focused && focused !== document.body && focused.isConnected && document.activeElement !== focused) {
    focused.focus({ preventScroll: true });
  }
};

export function observeSceneMeasurements(element) {
  let disposed = false;
  const refresh = () => {
    if (disposed) return;
    // Coalesce poster/font loads across scenes, and avoid repinning mid-gesture.
    clearTimeout(measurementTimer);
    measurementTimer = setTimeout(refreshMeasurements, 100);
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
    images.forEach(image => {
      image.removeEventListener("load", refresh);
      image.removeEventListener("error", refresh);
    });
  };
}
