const CATEGORIES = [/competition/i, /game|fun/i, /demonstration|demo/i];

export function selectFeaturedEvents(events, limit = 6) {
  const candidates = events.filter(event => event && typeof event.imgsrc === "string" && event.imgsrc.trim());
  const selected = [];
  const seen = new Set();
  const add = event => {
    const key = event._id || event.slug || event.name;
    if (selected.length < limit && !seen.has(key)) { seen.add(key); selected.push(event); }
  };
  CATEGORIES.forEach(category => candidates.filter(event => category.test(event.eventType || "")).slice(0, 2).forEach(add));
  candidates.forEach(add);
  return selected;
}
