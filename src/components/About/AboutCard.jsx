import React, { useState } from "react";
import './about.css';
import youtubeLogo from './youtube-logo.png';
import { 
  FaDownload, 
  FaExpand, 
  FaCompress, 
  FaExternalLinkAlt, 
  FaFilePdf 
} from "react-icons/fa";

function AboutCard({ content, image, imgToRight, title }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const pdfPath = "/pdf/tz.pdf";

  return (
    /* Increased padding-top so the entire About card clears the fixed navbar */
    <div className="about-container pt-28 md:pt-36 lg:pt-40 text-white">
      <div className="flex flex-col mx-4 md:mx-10 flex-wrap justify-center items-center">
        {/* about-card */}
        <div className="about-card text-black p-10 rounded-md w-full">
          <div className="z-5 flex justify-center items-center duration-700 flex-col sm:flex-row">
            <div className="theme-content sm:w-[100%] md:w-[45%] text-md space-x-9 text-gray-200">
              {content}
            </div>
          </div>
        </div>
        <br />
      </div>

      {/* YouTube Links */}
      <div className="youtube-links">
        <a 
          href="https://www.youtube.com/watch?v=LJLtHr0kcrA&t=1s" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="youtube-link"
        >
          <img src={youtubeLogo} alt="YouTube" className="youtube-icon" /> &nbsp;What is Technozion ?
        </a>
        <a 
          href="https://www.youtube.com/watch?v=1T_d1YoCWuA" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="youtube-link"
        >
          <img src={youtubeLogo} alt="YouTube" className="youtube-icon" /> &nbsp;Technozion Highlights
        </a>
      </div>

      {/* --- REFINED SCROLLING BROCHURE SECTION --- */}
      <section className="w-full z-10 my-16 px-4 max-w-6xl mx-auto flex flex-col items-center">
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-5xl font-extrabold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-200 to-cyan-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">
            Technozion Brochure
          </h2>
          <div className="h-0.5 w-32 bg-cyan-400/80 mx-auto mt-3 shadow-[0_0_12px_#00ffff]" />
        </div>

        {/* Brochure Container Frame */}
        <div 
          className={`w-full transition-all duration-300 ${
            isFullscreen
              ? "fixed inset-0 z-50 p-4 md:p-8 bg-black/95 flex flex-col justify-center backdrop-blur-md"
              : "relative border border-cyan-500/50 rounded-2xl bg-neutral-950/80 shadow-[0_0_35px_rgba(6,182,212,0.25)] overflow-hidden"
          }`}
        >
          {/* Top Control Bar */}
          <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-neutral-950/90 border-b border-cyan-500/30 gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#06b6d4]" />
              <span className="text-xs md:text-sm font-semibold tracking-wider text-cyan-300 uppercase flex items-center gap-2">
                <FaFilePdf className="text-red-400 text-base" /> Official Rulebook & Brochure
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5">
              {/* Download */}
              <a
                href={pdfPath}
                download="Technozion_Brochure.pdf"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-cyan-500/60 bg-cyan-950/50 hover:bg-cyan-500 hover:text-black text-cyan-300 text-xs font-bold tracking-wide transition duration-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
              >
                <FaDownload />
                <span>Download</span>
              </a>

              {/* New Tab */}
              <a
                href={pdfPath}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 hover:border-cyan-400 hover:text-cyan-300 bg-black/40 text-gray-300 text-xs font-medium transition duration-200"
                title="Open PDF in new tab"
              >
                <FaExternalLinkAlt />
                <span>Open Tab</span>
              </a>

              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="flex items-center gap-1.5 p-2 rounded-lg border border-white/20 hover:border-cyan-400 hover:text-cyan-300 bg-black/40 text-gray-300 text-xs transition duration-200"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
              >
                {isFullscreen ? <FaCompress className="text-sm" /> : <FaExpand className="text-sm" />}
              </button>
            </div>
          </div>

          {/* Scrolling PDF Viewport */}
          <div className={`w-full bg-[#111317] ${isFullscreen ? "h-[85vh]" : "h-[620px] md:h-[780px]"}`}>
            <iframe
              src={`${pdfPath}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
              title="Technozion Brochure Document"
              className="w-full h-full border-none"
            >
              {/* Fallback for devices without native PDF viewer */}
              <div className="p-8 text-center text-gray-300 flex flex-col items-center justify-center h-full gap-4">
                <p className="text-sm text-gray-400">
                  Your browser does not support inline scrolling PDF previews on this device.
                </p>
                <a
                  href={pdfPath}
                  download="Technozion_Brochure.pdf"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500 text-black font-bold rounded-lg shadow-[0_0_15px_#06b6d4] hover:bg-cyan-400 transition"
                >
                  <FaDownload /> Download Brochure PDF
                </a>
              </div>
            </iframe>
          </div>

          {/* Bottom Accent Glow */}
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />
        </div>
      </section>
    </div>
  );
}

export default AboutCard;