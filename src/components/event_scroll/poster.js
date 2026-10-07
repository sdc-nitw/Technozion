import React from "react";
import "./poster.css"; // Assuming you have some styles for Poster
import { useDepthSurface } from "../ui/DepthSurface";
import PosterSkeleton from "../Skeleton/PosterSkeleton";

const Poster = ({ imageSrc, fallbackSrc, title, content, footer, onClick }) => {
  const depth = useDepthSurface();
  const handleError = (e) => {
    e.target.onerror = null;
    if (fallbackSrc) e.target.src = fallbackSrc;
  };

  return (
    <div {...depth} className="poster depth-surface flex flex-col" onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined} aria-label={onClick ? `View ${title}` : undefined} onKeyDown={(event) => {
      if (onClick && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        onClick();
      }
    }}>
      <div className="relative">
        <PosterSkeleton
          src={imageSrc}
          alt={title}
          className=" rounded-md mb-2"
          onError={handleError}
        />
        <span className="poster-view">View</span>
      </div>
      {/* <img src={imageSrc} alt={title} onError={handleError} className="poster-image" /> */}

      <div className="flex flex-col justify-end min-h-[3.75rem]">
        <h3 className="font-bold">{title}</h3>
        <p className="opacity-70">{content}</p>
        {footer ? <p className="text-sm font-semibold mt-1">{footer}</p> : null}
      </div>
    </div>
  );
};

export default Poster;
