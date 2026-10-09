import { startTransition, useEffect, useState } from "react";
import { fetchEvents, getCachedEvents } from "./eventsData";

const EMPTY_EVENTS = [];

export default function useEvents() {
  const [events, setEvents] = useState(() => getCachedEvents());
  useEffect(() => {
    let mounted = true;
    fetchEvents().then(data => {
      if (mounted) startTransition(() => setEvents(data));
    });
    return () => { mounted = false; };
  }, []);
  return { events: events || EMPTY_EVENTS, isLoading: events === null };
}
