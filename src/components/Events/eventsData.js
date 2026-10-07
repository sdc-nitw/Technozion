import { API_URL } from "../../config";
import rawEvents from "../../data/new_events.json";
import { normalizeEvents } from "../../data/normalizeEvents";
import { orderEvents } from "./eventOrder";

const REQUEST_TIMEOUT_MS = 6000;
const CACHE_TTL_MS = 60 * 1000;
const RETRY_DELAY_MS = 15 * 1000;
let cache = { events: null, expiresAt: 0 };
let inFlight = null;
let fallbackEvents;

export const getFallbackEvents = () => {
  if (!fallbackEvents) fallbackEvents = orderEvents(normalizeEvents(rawEvents));
  return fallbackEvents;
};

// Cached data is available synchronously while an expired list is refreshed.
export const getCachedEvents = () => cache.events;

export const correctEventPoster = (event) => {
  const name = event.name || event.title;
  if (typeof name !== "string" || name.trim().toLowerCase() !== "warangal trading ring 2.0") {
    return event;
  }

  // This API assignment belongs to Bid to Build, not the FinWiz event.
  const corrected = { ...event };
  for (const field of ["imgsrc", "poster", "image"]) {
    if (/\/bid_to_build\.jpeg(?:[?#].*)?$/i.test(event[field] || "")) {
      corrected[field] = "";
    }
  }
  return corrected;
};

const fetchFromApi = async () => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_URL}/api/events`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`Failed to load events (${res.status})`);
    const data = await res.json();
    const list = Array.isArray(data) ? data : data && data.events;
    const events = Array.isArray(list)
      ? list.filter((event) => event && typeof event === "object" && typeof event.name === "string" && event.name.trim()).map(correctEventPoster)
      : [];
    if (!events.length) throw new Error("API returned no usable events");
    return orderEvents(events);
  } finally {
    clearTimeout(timer);
  }
};

export const fetchEvents = () => {
  if (cache.events && Date.now() < cache.expiresAt) return Promise.resolve(cache.events);
  if (inFlight) return inFlight;
  inFlight = fetchFromApi()
    .then((events) => {
      // An unchanged response should not rebuild pinned scenes or restart reveals.
      const unchanged = cache.events && JSON.stringify(cache.events) === JSON.stringify(events);
      cache = { events: unchanged ? cache.events : events, expiresAt: Date.now() + CACHE_TTL_MS };
      return cache.events;
    })
    .catch((error) => {
      console.warn("[events] Refresh unavailable; keeping cached events or using the bundled list:", error.message);
      cache = { events: cache.events || getFallbackEvents(), expiresAt: Date.now() + RETRY_DELAY_MS };
      return cache.events;
    })
    .finally(() => { inFlight = null; });
  return inFlight;
};
