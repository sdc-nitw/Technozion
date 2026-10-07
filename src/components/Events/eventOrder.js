const text = value => typeof value === "string" ? value.trim() : "";

export function eventPriority(event) {
  const name = text(event.title || event.name || event["Event Name"]);
  const club = text(event.club || event.clubName || event.societyName || event["Club Name"]);
  if (/^sdc\s*games$/i.test(name)) return 0;
  if (/\bcses?\b|computer\s+science(?:\s+and\s+engineering)?\s+society/i.test(club) || /^cses\b/i.test(name)) return 1;
  return 2;
}

export function compareEvents(a, b) {
  return eventPriority(a) - eventPriority(b) || Number(Boolean(text(b.imgsrc || b.poster || b.image))) - Number(Boolean(text(a.imgsrc || a.poster || a.image)));
}

export const orderEvents = events => [...events].sort(compareEvents);
