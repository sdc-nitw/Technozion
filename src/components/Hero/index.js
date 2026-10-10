import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowDown, FiArrowUpRight } from "react-icons/fi";
import TechCore from "./TechCore";
import TextReveal from "../Experience/TextReveal";
import tzText from "../../assets/tz_text.png";
import { gsap, useGSAP, motionConditions, observeSceneMeasurements } from "../../animation/gsap";
import './index.css';

// Countdown Component
const CountdownTimer = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isTimeUp, setIsTimeUp] = useState(false);

    useEffect(() => {
        const update = () => {
            const now = new Date();
            const diff = targetDate - now;
            if (diff <= 0) {
                setIsTimeUp(true);  // Mark timer as finished
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds });
        };
        update();
        const interval = setInterval(update, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    if (isTimeUp) {
        return null; // Hide the entire countdown component when the time is up
    }

    return (
        <div className="countdown-container">
            <div className="countdown-clock">
                <div className="time-box">
                    <span className="time-numeric">{String(timeLeft.days).padStart(2, "0")}</span>
                    <span className="time-label">Days</span>
                </div>
                <div className="time-box">
                    <span className="time-numeric">{String(timeLeft.hours).padStart(2, "0")}</span>
                    <span className="time-label">Hours</span>
                </div>
                <div className="time-box">
                    <span className="time-numeric">{String(timeLeft.minutes).padStart(2, "0")}</span>
                    <span className="time-label">Minutes</span>
                </div>
                <div className="time-box">
                    <span className="time-numeric">{String(timeLeft.seconds).padStart(2, "0")}</span>
                    <span className="time-label">Seconds</span>
                </div>
            </div>
        </div>
    );
};


const TARGET_DATE = new Date("2026-10-30T10:30:00Z");

export default function Hero() {
  const root = useRef(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(motionConditions, ({ conditions }) => {
      if (conditions.reduce) return;
      gsap.from(".hero-brand-reveal", { y: 70, opacity: 0, duration: 1.1, ease: "power3.out" });
      if (!conditions.desktop) {
        gsap.to(".hero-core", { y: -25, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
        return;
      }
      gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: ".hero-pin", pin: true, start: "top top", end: () => "+=" + window.innerHeight, scrub: true, invalidateOnRefresh: true, anticipatePin: 1 } })
        .to(".hero-core", { y: -100, scale: 1.08, duration: 1 }, 0)
        .to(".core-assembly", { rotationY: -12, rotationX: -18, duration: 1 }, 0)
        .to(".hero-brand-reveal", { xPercent: -9, scale: 1.12, duration: 1 }, 0)
        .to(".hero-display", { y: -160, opacity: 0, duration: .75 }, .25)
        .to(".hero-grid-layer", { yPercent: 18, scale: 1.1, duration: 1 }, 0)
        .to(".hero-energy", { rotation: 12, y: -65, duration: 1 }, 0);
    });
    const stopMeasuring = observeSceneMeasurements(root.current);
    return () => { stopMeasuring(); mm.revert(); };
  }, { scope: root });

  return <section className="hero-scene" ref={root} aria-label="Technozion 2026">
    <Link to="/#festival-statement" className="scene-skip">Skip opening scene <FiArrowDown /></Link>
    <div className="hero-pin">
      <div className="hero-grid-layer" aria-hidden="true" />
      <div className="hero-energy" aria-hidden="true"><span /><span /><span /></div>
      <div className="hero-brand-reveal"><div className="hero-wordmark"><img src={tzText} alt="TECHNOZION" /></div></div>
      <h1 className="hero-title sr-only">TECHNOZION 2026</h1>
      <div className="hero-core"><TechCore controlled /></div>
      <div className="hero-display">

        <TextReveal as="p" className="hero-slogan">IDEAS.<br />UNLEASHED.</TextReveal>
        <div className="hero-actions"><Link to="/events" className="scene-link">Explore the playground <FiArrowUpRight /></Link><Link to="/register" className="scene-link hero-register">Register for 2026 <FiArrowUpRight /></Link></div>
      </div>
      <div className="hero-bottom"><time className="hero-date" dateTime="2026-10-30" aria-label="October 30 to 31, 2026"><span className="hero-date-day">30–31</span><span className="hero-date-month">OCTOBER<strong>2026</strong></span></time><div className="hero-countdown"><p className="hero-status">THE COUNTDOWN IS ON</p><CountdownTimer targetDate={TARGET_DATE} /></div><Link to="/#festival-statement" className="hero-scroll-cue" aria-label="Scroll to explore"><FiArrowDown /></Link></div>
    </div>
  </section>;
}
