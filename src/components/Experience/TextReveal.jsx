import React, { useRef } from "react";
import { gsap, SplitText, useGSAP, motionConditions } from "../../animation/gsap";

export default function TextReveal({ as: Component = "h2", mode = "reveal", children, className = "", ...props }) {
  const ref = useRef(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(motionConditions, ({ conditions }) => {
      if (conditions.reduce) return;
      const split = SplitText.create(ref.current, {
        type: "lines,words", mask: "lines", autoSplit: true,
        onSplit(self) {
          return gsap.fromTo(self.words,
            mode === "scrub" ? { opacity: .24 } : { yPercent: 115, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: .8, stagger: mode === "scrub" ? .15 : .035, ease: "power3.out",
              scrollTrigger: { trigger: ref.current, start: "top 85%", end: "bottom 45%", scrub: mode === "scrub" ? .4 : false, once: mode !== "scrub" } }
          );
        },
      });
      return () => split.revert();
    });
    return () => mm.revert();
  }, { scope: ref, dependencies: [mode, children], revertOnUpdate: true });
  return <Component ref={ref} className={"text-reveal " + className} {...props}>{children}</Component>;
}
