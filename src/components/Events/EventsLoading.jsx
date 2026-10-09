import React from "react";
import "./loading.css";

export default function EventsLoading({ variant = "catalogue" }) {
  return <div className={`events-loading events-loading-${variant}`} role="status" aria-label="Loading events">
    <span className="sr-only">Loading events…</span>
    <div className={variant === "catalogue" ? "events-grid" : "events-loading-items"} aria-hidden="true">
      {Array.from({ length: variant === "featured" ? 2 : 10 }, (_, index) => <div key={index} className="event-placeholder"><span /><span /></div>)}
    </div>
  </div>;
}
