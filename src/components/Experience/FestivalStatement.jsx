import React, { useMemo, useRef } from "react";
import { gsap, useGSAP, motionConditions } from "../../animation/gsap";
import TextReveal from "./TextReveal";
import { festival } from "../../data/festival";
import ParallaxLayer from "./ParallaxLayer";
import { selectFeaturedEvents } from "../Events/featuredEvents";

export default function FestivalStatement({ events }) {
  const root = useRef(null);
  const posters = useMemo(() => selectFeaturedEvents(events).slice(0, 3), [events]);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(motionConditions, ({ conditions }) => {
      if (conditions.reduce) return;
      gsap.fromTo(".type-strip-inner", { xPercent: -12 }, { xPercent: 0, ease: "none", scrollTrigger: { trigger: ".type-strip", start: "top bottom", end: "bottom top", scrub: true } });
    });
    return () => mm.revert();
  }, { scope: root });
  return <section className="festival-statement" id="festival-statement" ref={root}>
    <div className="statement-posters" aria-hidden="true">{posters.map((event, index) => <ParallaxLayer key={event.slug || event.name} className={"statement-poster statement-poster-" + index} distance={60 + index * 35}><img src={event.imgsrc} alt="" loading="lazy" decoding="async" onError={e => { e.currentTarget.style.visibility = "hidden"; }} /></ParallaxLayer>)}</div>
    <div className="statement-content"><p className="scene-eyebrow">01 / A PLACE FOR THE RESTLESS</p><TextReveal className="statement-title">{festival.theme}</TextReveal><TextReveal as="p" mode="scrub" className="statement-copy">{festival.invitation}</TextReveal></div>
    <div className="type-strip" aria-hidden="true"><div className="type-strip-inner">MAKE / BREAK / BUILD / REPEAT / MAKE / BREAK / BUILD / REPEAT /</div></div>
  </section>;
}
