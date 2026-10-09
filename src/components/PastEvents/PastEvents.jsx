import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { WebCanvas } from "../bg_animation/bg_animate";
import YearTiles from "./YearTiles";
import YearView2025 from "./YearView2025";
import "./PastEvents.css";

export const PastEvents = () => {
  const { year } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [year]);

  const handleSelectYear = (selectedYear) => {
    navigate(`/past-events/${selectedYear}`);
  };

  const handleBackToYears = () => {
    navigate("/past-events");
  };

  return (
    <div className="past-events-root">
      <div className="past-events-canvas">
        <WebCanvas />
      </div>

      {year === "2025" ? (
        <YearView2025 onBack={handleBackToYears} />
      ) : (
        <YearTiles onSelectYear={handleSelectYear} />
      )}
    </div>
  );
};

export default PastEvents;
