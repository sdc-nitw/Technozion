import React, { useEffect, useState } from "react";
import Hero from "./Hero";
import Footer from "./Footer/footer";
import { fetchEvents } from "./Events/eventsData";
import FestivalStatement from "./Experience/FestivalStatement";
import PinnedEventShowcase from "./Experience/PinnedEventShowcase";
import FestivalClosing from "./Experience/FestivalClosing";
import "./Experience/experience.css";

export default function Home() {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    let mounted = true;
    fetchEvents().then(data => { if (mounted) setEvents(data); }).catch(() => { if (mounted) setEvents([]); });
    return () => { mounted = false; };
  }, []);
  return <main className="home-page festival-home"><Hero /><FestivalStatement events={events} /><PinnedEventShowcase events={events} /><FestivalClosing /><Footer /></main>;
}
