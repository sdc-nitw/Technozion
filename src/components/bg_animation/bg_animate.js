import React, { useRef, useEffect } from "react";

const MAX_POINTS = 180;
const LINK_DIST = 130;
const LINK_DIST_SQ = LINK_DIST * LINK_DIST;
const MOUSE_RADIUS = 110;
const MOUSE_RADIUS_SQ = MOUSE_RADIUS * MOUSE_RADIUS;

export const WebCanvas = () => {
  const canvasRef = useRef(null);
  const pointsRef = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let rafId = null;
    let visible = false;
    let resizeTimer = null;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const area = w * h;
      let count = Math.round((area / 1000000) * 250);
      if (count > MAX_POINTS) count = MAX_POINTS;
      if (count < 40) count = 40;

      pointsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
      }));

      ctx.clearRect(0, 0, w, h);
    };

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    };

    const onMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const onMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    const frame = () => {
      rafId = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;

      const pts = pointsRef.current;
      const mouse = mouseRef.current;
      const mActive = mouse.active;

      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];

        if (mActive) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          if (dx * dx + dy * dy < MOUSE_RADIUS_SQ) {
            p.x += dx * 0.12;
            p.y += dy * 0.12;
            continue;
          }
        }

        p.x += p.vx;
        p.y += p.vy;
        if (p.x > w || p.x < 0) p.vx *= -1;
        if (p.y > h || p.y < 0) p.vy *= -1;
      }

      ctx.lineWidth = 0.6;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST_SQ) {
            const alpha = 1 - Math.sqrt(d2) / LINK_DIST;
            ctx.strokeStyle = "rgba(22,246,243," + (0.55 * alpha).toFixed(3) + ")";
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
      },
      { threshold: 0 }
    );

    resize();
    observer.observe(canvas);
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseout", onMouseLeave, { passive: true });
    visible = true;
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(resizeTimer);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseout", onMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} />;
};