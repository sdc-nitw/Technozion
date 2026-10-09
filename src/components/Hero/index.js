import React, { useEffect, useState } from "react";
import './index.css';
import { WebCanvas } from "../bg_animation/bg_animate";
import TypingWords from "./TypingWords";

// Countdown Component
const CountdownTimer = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isTimeUp, setIsTimeUp] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const diff = targetDate - now;
            if (diff < 0) {
                clearInterval(interval);
                setIsTimeUp(true);  // Mark timer as finished
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    if (isTimeUp) {
        return null; // Hide the entire countdown component when the time is up
    }

    return (
        <div className="countdown-container">
            <div className="countdown-clock">
                <div className="time-box">
                    <span className="time-numeric">{timeLeft.days}</span>
                    <span className="time-label">Days</span>
                </div>
                <div className="time-box">
                    <span className="time-numeric">{timeLeft.hours}</span>
                    <span className="time-label">Hours</span>
                </div>
                <div className="time-box">
                    <span className="time-numeric">{timeLeft.minutes}</span>
                    <span className="time-label">Minutes</span>
                </div>
                <div className="time-box">
                    <span className="time-numeric">{timeLeft.seconds}</span>
                    <span className="time-label">Seconds</span>
                </div>
            </div>
        </div>
    );
};

const Hero = () => {
    // Set the target date and time for IST (Indian Standard Time)
    const targetDate = new Date("2026-10-30T10:30:00Z"); // This is 4:00 PM IST on October 30th, 2026

    return (
        <div>
            <div className="relative flex overflow-hidden mx-auto w-full">
                <WebCanvas />
                <div className="absolute h-full w-full top-0 left-0 spotlight opacity-95"></div>

                <div className='heading1 flex flex-col justify-center items-center' style={{ 'background': 'transparent' }}>
                    <div className="main-logo">

                  <span className="lg:text-5xl text-3xl font-bold mb-4 uppercase animate-pulse cursor-pointer">
          <TypingWords words={['TECHNOZION 2026', 'COMING SOON']} />
        </span>
                    </div>
                    {/* Countdown Clock */}
                    <CountdownTimer targetDate={targetDate} />
                    <section className="text-center mt-4 text-xl font-bold">
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Hero;
