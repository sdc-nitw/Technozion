import React, { useEffect } from 'react';
import { gsap, ScrollTrigger } from '../animation/gsap';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { About } from '../components/About';
import EventsPage from '../components/Events/EventsPage';
import Home from '../components/Home';
import { Team } from '../components/Team/team.jsx';
import Card from '../components/card/card.jsx';
import PastEvents from '../components/PastEvents/PastEvents.jsx';
import { ComingSoon } from "../components/ComingSoon/ComingSoon.jsx";
import Register from '../components/Register2/Register.jsx';
import RegistrationReceipt from '../components/Register2/RegistrationReceipt.jsx';
import VerifyEmail from "../components/Login/VerifyEmail";

const RoutesManager = () => {
	const { pathname, hash } = useLocation();
	useEffect(() => {
    if (!hash) { window.scrollTo({ top: 0, left: 0, behavior: "instant" }); return; }
    let frame;
    let scrollTween;
    let disposed = false;
    let observer;
    let targetId;
    try { targetId = decodeURIComponent(hash.slice(1)); } catch { return; }
    const align = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const target = document.getElementById(targetId);
        if (!disposed && target && !target.closest('[aria-busy="true"]')) {
          observer?.disconnect();
          frame = requestAnimationFrame(() => {
            if (disposed) return;
            ScrollTrigger.refresh();
            const top = target.getBoundingClientRect().top + window.scrollY - 100;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
              window.scrollTo({ top, behavior: "instant" });
            } else {
              scrollTween = gsap.to(window, { scrollTo: { y: top, autoKill: true }, duration: .7, ease: "power2.inOut", overwrite: "auto" });
            }
          });
        }
      });
    };
    observer = new MutationObserver(align);
    observer.observe(document.getElementById("root"), { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-busy"] });
    align();
    return () => { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); scrollTween?.kill(); };
  }, [pathname, hash]);

	return (
		<Routes>
			{/* Login page removed — no authentication required for registration */}
			<Route path="/auth" element={<Navigate to="/register" replace />} />
			<Route path="/auth/login" element={<Navigate to="/register" replace />} />
			<Route path="/auth/register" element={<Navigate to="/register" replace />} />
			<Route path="/login" element={<Navigate to="/register" replace />} />
			<Route path="/verify-email" element={<VerifyEmail />} />

			<Route path="/" element={<Home />} />
			<Route path="/register" element={<Register />} />
			<Route path="/registration-complete" element={<RegistrationReceipt />} />
			<Route path="/about" element={<About />} />
			<Route path="/events" element={<EventsPage />} />
			<Route path="/past-events" element={<PastEvents />} />
			<Route path="/past-events/:year" element={<PastEvents />} />
			<Route path="/pastevents" element={<PastEvents />} />
			<Route path="/pastevents/:year" element={<PastEvents />} />
			<Route path="/events/:year" element={<PastEvents />} />
			<Route path="/team" element={<Team />} />
			<Route path="/card" element={<Card />} />
			<Route path="*" element={<ComingSoon />} />
		</Routes>
	);
};

export default RoutesManager;
