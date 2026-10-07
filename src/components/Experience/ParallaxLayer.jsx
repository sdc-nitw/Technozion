import React, { useRef } from "react";
import { gsap, useGSAP, motionConditions } from "../../animation/gsap";

export default function ParallaxLayer({ children, className = "", distance = 80, ...props }) {
  const ref = useRef(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(motionConditions, ({ conditions }) => {
      if (conditions.reduce) return;
      const travel = conditions.desktop ? distance : Math.min(distance, 20);
      gsap.fromTo(ref.current, { y: travel }, { y: -travel, ease: "none", scrollTrigger: {
        trigger: ref.current.parentElement, start: "top bottom", end: "bottom top", scrub: true,
      } });
    });
    return () => mm.revert();
  }, { scope: ref, dependencies: [distance], revertOnUpdate: true });
  return <div ref={ref} className={"parallax-layer " + className} {...props}>{children}</div>;
}
