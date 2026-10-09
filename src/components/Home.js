import React from "react";
import Hero from "./Hero";
import Footer from "./Footer/footer";
import useEvents from "./Events/useEvents";
import EventsLoading from "./Events/EventsLoading";
import FestivalStatement from "./Experience/FestivalStatement";
import PinnedEventShowcase from "./Experience/PinnedEventShowcase";
import FestivalClosing from "./Experience/FestivalClosing";
import "./Experience/experience.css";

export default function Home() {
  const { events, isLoading } = useEvents();
  return <main className="home-page festival-home"><Hero /><FestivalStatement events={events} />{isLoading ? <EventsLoading variant="featured" /> : <PinnedEventShowcase events={events} />}<FestivalClosing /><Footer /></main>;
}
