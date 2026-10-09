import React, { useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiArrowDown, FiArrowLeft, FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import { gsap, useGSAP, motionConditions, observeSceneMeasurements } from "../../animation/gsap";
import { selectFeaturedEvents } from "../Events/featuredEvents";

function EventArtwork({ event }) {
  const [failed, setFailed] = useState(false);
  return <div className="chapter-art">
    <div className="chapter-art-frame">
      {!failed ? <img src={event.imgsrc} alt={event.name + " event poster"} loading="eager" decoding="async" onError={() => setFailed(true)} /> : <span className="chapter-art-fallback">Poster coming soon</span>}
    </div>
  </div>;
}

export default function PinnedEventShowcase({ events, id = "featured-events", browseHref = "/events#event-catalogue" }) {
  const featured = useMemo(() => selectFeaturedEvents(events), [events]);
  const root = useRef(null);
  const stage = useRef(null);
  const track = useRef(null);
  const progress = useRef(null);
  const controller = useRef(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const { pathname } = useLocation();

  const { contextSafe } = useGSAP(() => {
    if (!root.current || !featured.length) return;
    const mm = gsap.matchMedia();
    mm.add(motionConditions, ({ conditions }) => {
      const element = stage.current;
      const chapters = gsap.utils.toArray(".event-chapter", root.current);
      activeRef.current = 0;
      setActive(0);
      if (!conditions.desktop || conditions.reduce || featured.length < 2) {
        controller.current = index => chapters[index]?.scrollIntoView({ block: "center", behavior: conditions.reduce ? "instant" : "smooth" });
        return () => { controller.current = null; };
      }
      element.dataset.pinned = "true";
      const travel = () => Math.max(0, track.current.scrollWidth - element.clientWidth);
      const setProgress = gsap.quickSetter(progress.current, "scaleX");
      const tween = gsap.to(track.current, {
        x: () => -travel(), ease: "none",
        scrollTrigger: {
          trigger: element, start: "top 104px", end: () => "+=" + Math.max(1, travel()),
          pin: true, pinSpacing: true, scrub: .8, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate(self) {
            setProgress(self.progress);
            const next = Math.min(featured.length - 1, Math.round(self.progress * (featured.length - 1)));
            if (next !== activeRef.current) { activeRef.current = next; setActive(next); }
          },
        },
      });
      chapters.forEach(chapter => {
        gsap.fromTo(chapter.querySelector(".chapter-art-frame"), { rotationY: -12, rotationZ: -5, scale: .9 }, {
          rotationY: 0, rotationZ: 1, scale: 1, ease: "none",
          scrollTrigger: { trigger: chapter, containerAnimation: tween, start: "left 95%", end: "center center", scrub: true },
        });
      });
      controller.current = index => {
        const trigger = tween.scrollTrigger;
        const offset = chapters[index].offsetLeft - chapters[0].offsetLeft;
        const ratio = Math.min(1, Math.max(0, offset / Math.max(1, travel())));
        gsap.to(window, { scrollTo: { y: trigger.start + ratio * (trigger.end - trigger.start), autoKill: true }, duration: .45, ease: "power2.out", overwrite: "auto" });
      };
      return () => { delete element.dataset.pinned; controller.current = null; };
    });
    const stopMeasuring = observeSceneMeasurements(root.current);
    return () => { stopMeasuring(); mm.revert(); };
  }, { scope: root, dependencies: [featured], revertOnUpdate: true });
  const jumpTo = contextSafe(index => controller.current?.(index));
  if (!featured.length) return null;

  return <section className="event-showcase" id={id} ref={root} aria-label="Featured events">
    <Link className="scene-skip" to={pathname + "#" + id + "-end"}>Skip featured event journey <FiArrowDown /></Link>
    <div className="showcase-stage" ref={stage}>
      <header className="showcase-heading">
        <div><p className="scene-eyebrow">THE PLAYGROUND / 2026</p><h2>CHOOSE YOUR CHALLENGE<span>.</span></h2></div>
        <Link to={browseHref} className="scene-link">Browse all events <FiArrowUpRight /></Link>
      </header>
      <div className="showcase-track" ref={track}>
        {featured.map((event, index) => <article className="event-chapter" key={event._id || event.slug || event.name} data-active={index === active}>
          <span className="chapter-outline" aria-hidden="true">{event.eventType || "EVENT"}</span>
          <EventArtwork event={event} />
          <div className="chapter-copy">
            <p className="chapter-index"><span>{String(index + 1).padStart(2, "0")} / {String(featured.length).padStart(2, "0")}</span>{event.eventType}</p>
            <h3>{event.name}</h3>
            <p className="chapter-club">{event.club}</p>
            {event.description && <p className="chapter-description">{event.description}</p>}
            <Link to="/card" state={{ ...event, returnPath: pathname }} onFocus={() => { if (index !== activeRef.current && stage.current?.dataset.pinned) jumpTo(index); }} className="scene-link chapter-detail">Explore event <FiArrowUpRight /></Link>
          </div>
        </article>)}
      </div>
      <footer className="showcase-controls">
        <p><span>{String(active + 1).padStart(2, "0")}</span> / {String(featured.length).padStart(2, "0")} <span className="showcase-scroll-hint">SCROLL TO EXPLORE</span></p>
        <div className="showcase-progress" aria-hidden="true"><span ref={progress} /></div>
        <div className="showcase-buttons">
          <button type="button" aria-label="Previous featured event" disabled={active === 0} onClick={() => jumpTo(Math.max(0, active - 1))}><FiArrowLeft /></button>
          <button type="button" aria-label="Next featured event" disabled={active === featured.length - 1} onClick={() => jumpTo(Math.min(featured.length - 1, active + 1))}><FiArrowRight /></button>
        </div>
      </footer>
    </div>
    <div id={id + "-end"} className="scene-end" tabIndex={-1} />
  </section>;
}
