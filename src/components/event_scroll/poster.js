import React from "react";
import "./poster.css"; // Assuming you have some styles for Poster
import PosterSkeleton from "../Skeleton/PosterSkeleton";

const Poster = ({ imageSrc, fallbackSrc, title, content, footer, onClick }) => {
  const handleError = (e) => {
    e.target.onerror = null;
    if (fallbackSrc) e.target.src = fallbackSrc;
  };

  return (
    <div className="poster flex flex-col" onClick={onClick}>
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
