import React, { useEffect, useRef, useState } from "react";
import "./card.css";
import { WebCanvas } from "../bg_animation/bg_animate";
import fallbackImg from "./tzcomingsoon.png";
import PosterSkeleton from "../Skeleton/PosterSkeleton";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaExternalLinkAlt } from "react-icons/fa";
import { MdContentCopy } from "react-icons/md";
import CopyWrapper from "../utils/CopyWrapper";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

const toRuleList = (value) => {
  if (Array.isArray(value)) {
    return value.filter((v) => typeof v === "string" || typeof v === "number");
  }
  if (typeof value === "string" && value.trim()) return [value];
  return [];
};
const toContactList = (value) => {
  return Array.isArray(value)
    ? value.filter((c) => c && typeof c === "object")
    : [];
}

const Card = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    name : title,
    club,
    description,
    teamSize,
    contact,
    rules,
    judgingCriteria,
    imgsrc,
    glink,
    totalCost,
    cashPrize,
    duration,
    eventType
  } = location.state || {};
  const contactList = toContactList(contact);
  const ruleList = toRuleList(rules);
  const [imageSrc, setImageSrc] = useState(imgsrc);
  const cardRef = useRef(null);

  // Handles navigation back
  const handleBack = React.useCallback(() => {
    if (location.state?.returnPath) {
      navigate(location.state.returnPath);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/events");
    }
  }, [navigate, location.state]);

  // Handles clicking outside the card
  const handleContainerClick = (e) => {
    if (cardRef.current && !cardRef.current.contains(e.target)) {
      handleBack();
    }
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleBack();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleBack]);

  // Handles image load error
  const handleImageError = () => {
    setImageSrc((current) => (current === fallbackImg ? "" : fallbackImg));
  };

  if (!location.state) {
    return <Navigate to="/events" replace />;
  }

  const hasPrizes = Boolean(
    location.state?.hasPrizes ||
    (typeof cashPrize === "string" && cashPrize.trim()) ||
    Number(totalCost) > 0 ||
    eventType?.toLowerCase() === "competition" ||
    /prize/i.test(description || "")
  );
  
    const showDuration =
    typeof duration === "string" &&
    duration.trim() !== "" &&
    duration.toLowerCase() !== "not applicable";
  
    return (
    <div className="card-container" onClick={handleContainerClick}>
      <div className="web-canvas">
        <WebCanvas />
      </div>

      <div
        ref={cardRef}
        className="event_card wrap active"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text">
          {/* Card Header with single Back button */}
          <div className="cardnav p-4 lg:px-6 z-10">
            <div className="flex items-center gap-2 flex-wrap">
              {club && (
                <span className="text-xs uppercase tracking-widest px-3 py-1 rounded-full border border-cyan-400/40 bg-cyan-950/40 text-cyan-300 font-semibold">
                  {club}
                </span>
              )}
              {eventType && (
                <span className="text-xs uppercase tracking-widest px-3 py-1 rounded-full border border-cyan-500/30 bg-black/40 text-cyan-400 font-semibold">
                  {eventType}
                </span>
              )}
            </div>
            <button
              className="back-button flex items-center gap-x-2"
              onClick={handleBack}
            >
              <span>
                <IoMdArrowRoundBack />
              </span>
              Back
            </button>
          </div>

          {/* Three Sections: Image, Overview, Rules */}
          <div className="card-sections-container">
            {/* Section 1: Image */}
            <div className="card-section card-section-image">
              <div className="poster-frame">
                <PosterSkeleton
                  src={imageSrc}
                  alt={title || "Event Poster"}
                  className="cnt-logo rounded-xl"
                  onError={handleImageError}
                />
              </div>
            </div>

            {/* Section 2: Overview */}
            <div className="card-section card-section-overview custom-scrollbar">
              <div className="font-bold text-2xl lg:text-3xl uppercase tracking-wide text-cyan-300 mb-4">
                {title}
              </div>

              {glink && (
                <div className="mb-5">
                  <a
                    href={glink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="register-btn inline-flex items-center gap-x-2.5 px-4 py-2.5 rounded-lg border border-cyan-400 text-cyan-300 bg-cyan-950/40 hover:bg-cyan-500/20 hover:scale-105 duration-200 transition-all text-sm font-semibold"
                  >
                    <FaExternalLinkAlt className="text-xs" />
                    <span>Register Now</span>
                  </a>
                </div>
              )}

              {description && (
                <section className="overview-item mb-5 flex flex-col gap-y-1">
                  <span className="section-label opacity-70 text-[0.95rem] tracking-wider uppercase">
                    Description
                  </span>
                  <div className="section-text text-sm lg:text-[1.05rem] leading-relaxed whitespace-pre-line">
                    {description}
                  </div>
                </section>
              )}

              {hasPrizes && (
                <section className="overview-item mb-5 flex flex-col gap-y-1">
                  <span className="section-label opacity-70 text-[0.95rem] tracking-wider uppercase">
                    Prizes
                  </span>
                  <span className="text-xl lg:text-2xl font-bold text-cyan-300">
                    Exciting prizes are available!
                  </span>
                </section>
              )}

              {teamSize&& (
                <section className="overview-item mb-5 flex flex-col gap-y-1">
                  <span className="section-label opacity-70 text-[0.95rem] tracking-wider uppercase">
                    Participation
                  </span>
                  <div className="font-bold text-sm lg:text-base">
                    {String(teamSize) === "1"
                      ? "Individual"
                      : teamSize}
                  </div>
                </section>
              )}

              {showDuration && (
                <section className="overview-item mb-5 flex flex-col gap-y-1">
                  <span className="section-label opacity-70 text-[0.95rem] tracking-wider uppercase">
                    Estimated Duration
                  </span>
                  <div className="font-bold text-sm lg:text-base">{duration}</div>
                </section>
              )}

              {contactList.length > 0 && (
                <section className="overview-item mb-4 flex flex-col gap-y-1">
                  <span className="section-label opacity-70 text-[0.95rem] tracking-wider uppercase mb-1">
                    Contact
                  </span>
                  <div className="flex flex-col gap-3">
                    {contactList.map((contact, index) => (
                      <div
                        key={index}
                        className="contact-card p-3 rounded-lg bg-black/40 border border-cyan-500/20 flex flex-col gap-y-1"
                      >
                        {contact?.name && (
                          <span className="text-xs lg:text-sm opacity-70 font-medium">
                            {contact.name}
                          </span>
                        )}
                        {contact?.phone && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-cyan-300 font-medium">
                              {String(contact.phone).startsWith("+91") ? contact.phone : `+91 ${contact.phone}`}
                            </span>
                            <CopyWrapper text={contact.phone}>
                              <MdContentCopy className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity" />
                            </CopyWrapper>
                          </div>
                        )}
                        {contact?.email && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-cyan-300 truncate mr-2 font-medium">
                              {contact.email}
                            </span>
                            <CopyWrapper text={contact.email}>
                              <MdContentCopy className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity" />
                            </CopyWrapper>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {hasPrizes && (
                    <small className="opacity-60 text-xs mt-2 block">
                      *Prizes will be awarded based on judging criteria
                    </small>
                  )}
                </section>
              )}
            </div>

            {/* Section 3: Rules */}
            <div className="card-section card-section-rules custom-scrollbar">
              <div className="font-bold text-2xl lg:text-3xl uppercase tracking-wide text-cyan-300 mb-4">
                Rules & Structure
              </div>

              {ruleList.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {ruleList.map((rawRule, index) => {
                    const rule = String(rawRule);
                    const isUrl = /^https?:\/\//i.test(rule.trim());
                    const ruleClean = rule.replace(/^\d+[.)]\s*/, "").trim();
                    return (
                      <div key={index} className="rule-item flex items-start gap-3 p-3.5 rounded-lg bg-black/40 border border-cyan-500/20">
                        <span className="font-bold text-cyan-300 min-w-[22px]">{index + 1}.</span>
                        {isUrl ? (
                          <a
                            href={rule.trim()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-300 underline hover:text-cyan-200 text-sm lg:text-[0.95rem] leading-relaxed break-all inline-flex items-center gap-1.5"
                          >
                            <span>Open Detailed Document</span>
                            <FaExternalLinkAlt className="text-xs shrink-0" />
                          </a>
                        ) : (
                          <span className="text-sm lg:text-[0.95rem] leading-relaxed whitespace-pre-line">
                            {ruleClean || rule}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-black/30 border border-cyan-500/20 text-sm opacity-70">
                  No specific rules provided for this event. Follow general fest
                  guidelines.
                </div>
              )}

              {judgingCriteria && judgingCriteria !== "Coming Soon..." && (
                <div className="mt-6">
                  <div className="font-bold text-lg uppercase tracking-wide text-cyan-300 mb-2">
                    Judging Criteria
                  </div>
                  <div className="p-3.5 rounded-lg bg-black/40 border border-cyan-500/20 text-sm lg:text-[0.95rem] leading-relaxed">
                    {judgingCriteria}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
