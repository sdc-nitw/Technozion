import React, { useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";

function PosterSkeleton({ src, alt, className = "", ...props }) {
  const [loaded, setLoaded] = useState(false);

  if (!src) {
    return (
      <div
        className={`relative w-full aspect-[4/5] rounded-lg bg-gradient-to-b from-[#071d24] via-[#051419] to-[#020a0d] border border-cyan-500/25 flex flex-col items-center justify-center p-4 text-center ${className}`}
      >
        <div className="w-12 h-12 rounded-full bg-cyan-950/70 border border-cyan-400/40 flex items-center justify-center text-cyan-300 mb-2 shadow-[0_0_15px_rgba(22,246,243,0.25)]">
          <FaCalendarAlt className="text-xl" />
        </div>
        <span className="text-[0.65rem] md:text-[0.7rem] uppercase tracking-widest text-cyan-400/80 font-bold">
          Poster TBA
        </span>
      </div>
    );
  }

  // Handles image load error
  return (
    <div className="relative w-full aspect-[4/5] rounded-lg bg-gray-800">
      {!loaded && (
        <div className="absolute inset-0 animate-pulse max-h-full bg-slate-800 bg-opacity-75" />
      )}

      <img
        {...props}
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`block w-full aspect-[4/5] object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        } ${className}`}
      />
    </div>
  );
}

export default PosterSkeleton;
