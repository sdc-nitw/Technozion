import React, { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Poster from "../event_scroll/poster";
import useEvents from "./useEvents";
import EventsLoading from "./EventsLoading";
import { compareEvents } from "./eventOrder";
import { gsap, useGSAP, motionConditions, observeSceneMeasurements } from "../../animation/gsap";
import "../Experience/experience.css";
import "../PastEvents/PastEvents.css";
import "../event_scroll/index.css";

const CATEGORY_TABS = [
  { key: "all", label: "ALL" },
  { key: "competition", label: "COMPETITIONS" },
  { key: "game", label: "GAMES" },
  { key: "demonstration", label: "DEMONSTRATIONS" },
];

export const EventsPage = () => {
  const navigate = useNavigate();
  const catalogue = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { events, isLoading } = useEvents();
  const filteredEvents = useMemo(() => events.filter((ev) => {
    if (selectedCategory === "all") return true;
    const typeLower = (ev.eventType || "").toLowerCase();
    if (selectedCategory === "competition") {
      return typeLower.includes("competition");
    }
    if (selectedCategory === "game" || selectedCategory === "funevent") {
      return typeLower.includes("game") || typeLower.includes("fun");
    }
    if (selectedCategory === "demonstration") {
      return typeLower.includes("demonstration") || typeLower.includes("demo");
    }
    if (selectedCategory === "workshop") {
      return typeLower.includes("workshop");
    }
    return true;
  }).sort(compareEvents), [events, selectedCategory]);

  useGSAP(() => {
    if (!catalogue.current) return;
    const mm = gsap.matchMedia();
    mm.add(motionConditions, ({ conditions }) => {
      if (conditions.reduce) return;
      gsap.utils.toArray(".catalogue-item", catalogue.current).forEach((item, index) => {
        gsap.from(item, { y: 32, opacity: 0, duration: .55, delay: (index % 5) * .04, ease: "power2.out", scrollTrigger: { trigger: item, start: "top 94%", once: true } });
      });
    });
    const stopMeasuring = observeSceneMeasurements(catalogue.current);
    return () => { stopMeasuring(); mm.revert(); };
  }, { scope: catalogue, dependencies: [filteredEvents], revertOnUpdate: true });

  const eventCount = filteredEvents.length;
  const countLabel =
    isLoading ? "EVENTS" : `${eventCount} ${eventCount === 1 ? "EVENT" : "EVENTS"}`;

  const handlePosterClick = (item) => {
    navigate("/card", {
      state: {
        ...item,
        imgsrc: item.imgsrc || "",
        glink: item.glink || "",
        returnPath: "/events",
      },
    });
  };
  
 return (
    <div className="past-events-root festival-events" aria-busy={isLoading}>

      {/* Added pt-20 md:pt-28 to clear the floating navbar tz logo */}
      <div className="edition-view-container">
        {/* Top Header Bar */}
        <div className="edition-topbar">
          <div className="edition-topbar-row">
            <div className="edition-badge-container">
              <h1 className="edition-title-badge">Technozion 2026</h1>
              <span className="edition-year-pill">{countLabel}</span>
            </div>

            {/* Category Filter Tabs */}
            <div className="tabs my-0">
              {CATEGORY_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`tab-button ${
                    selectedCategory === tab.key ? "active" : ""
                  }`}
                  onClick={() => setSelectedCategory(tab.key)}
                  aria-pressed={selectedCategory === tab.key}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>


        {/* Complete, directly accessible event catalogue. */}
        <div className="edition-content-body" id="event-catalogue" ref={catalogue} tabIndex={-1}>
          <div className="catalogue-heading"><p className="scene-eyebrow">FIND YOUR NEXT CHALLENGE</p><h2>ALL EVENTS<span>.</span></h2></div>
          <div className="events-grid">
            {filteredEvents.map((item, index) => (
              <div className="catalogue-item" key={item._id || item.slug || index}><Poster
                imageSrc={item.imgsrc || ""}
                fallbackSrc=""
                title={item.name}
                content={item.club}
                onClick={() => handlePosterClick(item)}
              /></div>
            ))}
          </div>
          {isLoading && <EventsLoading />}
          {!isLoading && filteredEvents.length === 0 && (
            <p className="text-center opacity-70 my-8">No events available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
