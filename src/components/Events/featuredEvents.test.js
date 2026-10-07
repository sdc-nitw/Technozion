import { selectFeaturedEvents } from "./featuredEvents";
const event = (slug, eventType, imgsrc = "/poster.png") => ({ slug, name: slug, eventType, imgsrc });

test("balances categories, preserves source order within categories, and caps the journey", () => {
  const events = [event("g1", "Game"), event("c1", "Competition"), event("c2", "Competition"), event("c3", "Competition"), event("d1", "Demonstration"), event("g2", "Game"), event("d2", "Demonstration")];
  expect(selectFeaturedEvents(events).map(e => e.slug)).toEqual(["c1", "c2", "g1", "g2", "d1", "d2"]);
});

test("fills scarce categories without duplicate events or missing artwork", () => {
  const events = [event("missing", "Game", ""), event("first", "Competition"), event("first", "Competition"), event("second", "Workshop"), event("third", "Game", "  ")];
  expect(selectFeaturedEvents(events).map(e => e.slug)).toEqual(["first", "second"]);
  expect(selectFeaturedEvents([])).toEqual([]);
  expect(selectFeaturedEvents(events, 1)).toHaveLength(1);
});
