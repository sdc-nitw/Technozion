import React, { useState } from "react";
import './about.css';
import DepthSurface from '../ui/DepthSurface';
import { FiCpu, FiArrowUpRight } from 'react-icons/fi';
import youtubeLogo from './youtube-logo.png';
import { FaDownload, FaExpand, FaCompress, FaExternalLinkAlt, FaFilePdf } from "react-icons/fa";

function AboutCard({ content, title }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const pdfPath = "/pdf/tz.pdf";

  return (
    <div className="about-container">
      <DepthSurface as="section" className="about-intro ui-panel">
        <div className="section-kicker"><FiCpu /> THE TECHNOZION EXPERIENCE <FiArrowUpRight /></div>
        <h1>{title}</h1>
        <p className="theme-content">{content}</p>
      </DepthSurface>
      <div className="youtube-links">
        <a href="https://www.youtube.com/watch?v=LJLtHr0kcrA&t=1s" target="_blank" rel="noopener noreferrer" className="youtube-link ui-button">
          <img src={youtubeLogo} alt="" className="youtube-icon" /> What is Technozion ?
        </a>
        <a href="https://www.youtube.com/watch?v=1T_d1YoCWuA" target="_blank" rel="noopener noreferrer" className="youtube-link ui-button">
          <img src={youtubeLogo} alt="" className="youtube-icon" /> Technozion Highlights
        </a>
      </div>
      <section className="brochure-section" aria-labelledby="brochure-title">
        <div className="brochure-title"><h2 id="brochure-title">Technozion Brochure</h2></div>
        <div className={isFullscreen ? "brochure-fullscreen" : "brochure-frame ui-panel"}>
          <div className="brochure-toolbar">
            <span className="brochure-label"><FaFilePdf /> Official Rulebook &amp; Brochure</span>
            <div className="brochure-actions">
              <a href={pdfPath} download="Technozion_Brochure.pdf" className="ui-button ui-button-primary"><FaDownload /> Download</a>
              <a href={pdfPath} target="_blank" rel="noopener noreferrer" className="ui-button"><FaExternalLinkAlt /> Open Tab</a>
              <button type="button" onClick={() => setIsFullscreen(!isFullscreen)} className="ui-button" aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"} aria-pressed={isFullscreen}>
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </button>
            </div>
          </div>
          <div className="brochure-viewport">
            <iframe src={pdfPath + "#toolbar=0&navpanes=0&scrollbar=1&view=FitH"} title="Technozion Brochure Document">
              <a href={pdfPath} download="Technozion_Brochure.pdf">Download Brochure PDF</a>
            </iframe>
          </div>
        </div>
      </section>
    </div>
  );
}
export default AboutCard;
