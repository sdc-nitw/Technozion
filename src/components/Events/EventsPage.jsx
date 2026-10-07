import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WebCanvas } from "../bg_animation/bg_animate";
import Poster from "../event_scroll/poster";
import {Loader} from "../Loader/index"
import { fetchEvents } from "./eventsData";
import "../PastEvents/PastEvents.css";
import "../event_scroll/index.css";

const CATEGORY_TABS = [
  { key: "all", label: "ALL" },
  { key: "competition", label: "COMPETITIONS" },
  { key: "game", label: "GAMES" },
  { key: "demonstration", label: "DEMONSTRATIONS" },
];

const hasPoster = (event) =>
  typeof event.imgsrc === "string" && event.imgsrc.trim().length > 0;

export const EventsPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    let isMounted = true;
    fetchEvents()
      .then((data) => {
        if (isMounted) setEvents(data);
      })
      .catch((err) => {
        console.error("Error loading events:", err);
        if (isMounted) setError(err.message || "Failed to load events");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);
  const filteredEvents = events.filter((ev) => {
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
  }).sort((a, b) => Number(hasPoster(b)) - Number(hasPoster(a)));

  const eventCount = filteredEvents.length;
  const countLabel =
    isLoading || error ? "EVENTS" : `${eventCount} ${eventCount === 1 ? "EVENT" : "EVENTS"}`;

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
    <div className="past-events-root">
      <div className="past-events-canvas">
        <WebCanvas />
      </div>

      {/* Added pt-20 md:pt-28 to clear the floating navbar tz logo */}
      <div className="edition-view-container pt-12 md:pt-16">
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

        {/* Events Grid */}
        <div className="edition-content-body">
          <div className="grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-x-4 gap-y-8 lg:gap-y-10 lg:m-6 m-3">
            {filteredEvents.map((item, index) => (
              <Poster
                key={item._id || item.slug || index}
                imageSrc={item.imgsrc || ""}
                fallbackSrc=""
                title={item.name}
                content={item.club}
                onClick={() => handlePosterClick(item)}
              />
            ))}
          </div>
          {isLoading && <Loader/>}
          {!isLoading && error && (
            <p className="text-center text-red-400 my-8">Error: {error}</p>
          )}
          {!isLoading && !error && filteredEvents.length === 0 && (
            <p className="text-center opacity-70 my-8">No events available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
