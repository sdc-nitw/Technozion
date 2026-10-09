import React, { useCallback, useEffect, useRef } from "react";

// Pointer work is limited to the active surface and one update per frame.
export function useDepthSurface() {
  const ref = useRef(null);
  const frame = useRef(null);
  const reset = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = null;
    if (!ref.current) return;
    for (const name of ["--tilt-x", "--tilt-y", "--pointer-x", "--pointer-y"]) {
      ref.current.style.removeProperty(name);
    }
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const onPreferenceChange = () => reset();
    reduced?.addEventListener?.("change", onPreferenceChange);
    return () => {
      cancelAnimationFrame(frame.current);
      reduced?.removeEventListener?.("change", onPreferenceChange);
    };
  }, [reset]);

  const onPointerMove = (event) => {
    if (event.pointerType !== "mouse" || !ref.current ||
      window.matchMedia?.("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;
    const rect = ref.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      if (!ref.current) return;
      ref.current.style.setProperty("--tilt-x", ((.5 - y) * 7).toFixed(2) + "deg");
      ref.current.style.setProperty("--tilt-y", ((x - .5) * 9).toFixed(2) + "deg");
      ref.current.style.setProperty("--pointer-x", (x * 100).toFixed(1) + "%");
      ref.current.style.setProperty("--pointer-y", (y * 100).toFixed(1) + "%");
      frame.current = null;
    });
  };

  return { ref, onPointerMove, onPointerLeave: reset, onPointerCancel: reset };
}

export default function DepthSurface({ as: Component = "div", className = "", children, ...props }) {
  const depth = useDepthSurface();
  return <Component {...props} {...depth} className={"depth-surface " + className}>{children}</Component>;
}
