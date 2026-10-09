import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Poster from "../event_scroll/poster.js";
import { Loader } from "../Loader/index.js";
import "../event_scroll/index.css";
import imgsrc from "../event_scroll/tzcomingsoon.png";
import { legacyToFlat } from "../utils/eventShape";
import { orderEvents } from "../Events/eventOrder";

const TABS = [
  { key: "clubevents", label: "CLUB" },
  { key: "societies", label: "DEPARTMENT" },
  { key: "projects", label: "PROJECTS EXPO" },
];

export const EventsBrowser = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    return params.get("tab") || location.state?.dataSource || "clubevents";
  };

  const [selectedTab, setSelectedTab] = useState(getInitialTab);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromSearch = params.get("tab");
    const tabFromState = location.state?.dataSource;

    const preferred = tabFromSearch || tabFromState;
    if (preferred && preferred !== selectedTab) {
      setSelectedTab(preferred);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, location.state]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("tab") !== selectedTab) {
      params.set("tab", selectedTab);
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let response;
        if (selectedTab === "societies") {
          response = await fetch("/dataJSON/societyx.json");
        } else if (selectedTab === "spotlight") {
          response = await fetch("/dataJSON/spotlight.json");
        } else if (selectedTab === "clubevents") {
          response = await fetch("/dataJSON/club.json");
        } else if (selectedTab === "projects") {
          response = await fetch("/dataJSON/workshop.json");
        } else {
          response = await fetch("/dataJSON/spotlight.json");
        }

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const result = await response.json();
        if (!isMounted) return;
        setData(selectedTab === "societies"
          ? orderEvents(result.map(society => ({ ...society, events: orderEvents(society.events || []) })))
          : orderEvents(result.map(item => ({ ...item, club: item.club || item.name }))));
      } catch (err) {
        console.error("Error loading data:", err);
        if (!isMounted) return;
        setError(err.message || "Unknown error");
        setData([]);
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [selectedTab]);

  const handlePosterClick = (item) => {
    navigate("/card", {
      state: { ...legacyToFlat(item), imgsrc: item.imgsrc || imgsrc, glink: item.glink }
    });
  };

  const renderSocieties = () => {
    return data.map((society, sIdx) => (
      <div key={`society-${sIdx}-${society.societyName || sIdx}`} className="mb-8">
        <h2 className="society-heading text-xl md:text-2xl text-cyan-300 font-bold mb-4 tracking-wider uppercase">
          {society.societyName}
        </h2>
        <div className="events-grid">
          {society.events?.map((event, index) => (
            <Poster
              key={`event-${sIdx}-${index}-${event.title || index}`}
              imageSrc={event.imgsrc}
              fallbackSrc={imgsrc}
              title={event.title}
              content={event.name}
              onClick={() => handlePosterClick(event)}
            />
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div className="events-browser-container flex flex-col w-full h-full">
      {/* Category sub-tabs */}
      <div className="tabs-wrapper my-4">
        <div className="tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`tab-button ${
                selectedTab === tab.key ? "active" : ""
              }`}
              onClick={() => setSelectedTab(tab.key)}
              aria-pressed={selectedTab === tab.key}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events content area */}
      <div className="inner-container flex-1">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader />
          </div>
        ) : error ? (
          <div className="fetch-error">Error: {error}</div>
        ) : !data || (Array.isArray(data) && data.length === 0) ? (
          <div className="fetch-error">No data available</div>
        ) : selectedTab === "societies" ? (
          renderSocieties()
        ) : (
          <div className="events-grid">
            {data.map((item, index) => (
              <Poster
                key={index}
                imageSrc={item.imgsrc}
                fallbackSrc={imgsrc}
                title={item.title}
                content={item.name}
                onClick={() => handlePosterClick(item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsBrowser;
