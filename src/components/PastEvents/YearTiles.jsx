import React from "react";
import { FaCalendarAlt, FaUsers, FaLaptopCode, FaRocket } from "react-icons/fa";
import { BsArrowRight } from "react-icons/bs";

const EDITIONS = [
  {
    year: "2025",
    title: "Technozion '25",
    tagline: "South India's Premier Annual Technical Extravaganza",
    editionNumber: "#25",
    badge: "Previous Edition",
    statusColor: "#00ffaa",
    highlights: [
      { label: "30+ Events & Competitions", icon: <FaCalendarAlt className="highlight-icon" /> },
      { label: "Departmental Societies", icon: <FaLaptopCode className="highlight-icon" /> },
      { label: "Projects Expo", icon: <FaRocket className="highlight-icon" /> },
      { label: "Organizing Team & Council", icon: <FaUsers className="highlight-icon" /> },
    ],
  },
];

export const YearTiles = ({ onSelectYear }) => {
  return (
    <div className="year-selection-container">
      {/* Header section */}
      <div className="year-selection-header">
        <div className="archive-pill-badge">
          <span className="pulse-dot"></span>
          <span>Official Technozion Archives</span>
        </div>
        <h1 className="year-selection-title">Past Editions</h1>
        <p className="year-selection-subtitle">
          Step into our legacy. Explore the innovations, competitions, workshops,
          and the dedicated teams who powered previous editions of Technozion.
        </p>
      </div>

      {/* Grid of Year Cards (Currently featuring 2025) */}
      <div className="year-tiles-grid">
        {EDITIONS.map((edition) => (
          <div
            key={edition.year}
            className="year-card-2025"
            onClick={() => onSelectYear(edition.year)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onSelectYear(edition.year);
              }
            }}
            aria-label={`View ${edition.title} Archive`}
          >
            {/* Ambient glowing radial effect */}
            <div className="card-ambient-glow"></div>

            {/* Top row with status badge and edition number */}
            <div className="year-card-top">
              <div className="edition-status-badge">
                <span className="edition-status-dot"></span>
                <span>{edition.badge}</span>
              </div>
              <span className="edition-tag">{edition.editionNumber} ARCHIVE</span>
            </div>

            {/* Main year display */}
            <div className="year-card-main">
              <div className="year-card-number-wrapper">
                <span className="year-number-big">{edition.year}</span>
                <span className="year-badge-accent">EDITION</span>
              </div>
              <h2 className="year-card-title">{edition.title}</h2>
              <p className="year-card-tagline">{edition.tagline}</p>
            </div>

            {/* Highlights pills */}
            <div className="year-highlights-container">
              {edition.highlights.map((h, i) => (
                <div key={i} className="year-highlight-pill">
                  {h.icon}
                  <span>{h.label}</span>
                </div>
              ))}
            </div>

            {/* Bottom action row */}
            <div className="year-card-bottom">
              <span className="year-card-explore-hint">
                Contains Events, Expos & Organizing Team
              </span>
              <button
                type="button"
                className="explore-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectYear(edition.year);
                }}
              >
                <span>Explore 2025</span>
                <BsArrowRight className="explore-arrow" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YearTiles;
