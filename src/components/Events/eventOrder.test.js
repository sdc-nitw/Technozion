import { orderEvents } from "./eventOrder";
import { selectFeaturedEvents } from "./featuredEvents";
import { getFallbackEvents } from "./eventsData";

test("prioritizes SDC Games and every CSE Society event ahead of other posters without mutating data", () => {
  const events = [
    { name: "Other", imgsrc: "/other.jpg" },
    { name: "AI Unveiled", club: "CSE Society", imgsrc: "" },
    { name: "SDC Games", imgsrc: "/sdc.jpg" },
    { name: "CSES Arcade", club: "CSE Society", imgsrc: "/cses.jpg" },
    { name: "No poster" },
  ];
  expect(orderEvents(events).map(e => e.name)).toEqual(["SDC Games", "CSES Arcade", "AI Unveiled", "Other", "No poster"]);
  expect(events[0].name).toBe("Other");
  expect(selectFeaturedEvents(events).map(e => e.name)).toEqual(["SDC Games", "CSES Arcade", "Other"]);
});

test("recognizes society name variants and keeps ordinary event ordering stable", () => {
  const events = [{ name: "Other 1" }, { name: "Other 2" }, { title: "Old CSE event", societyName: "Computer Science and Engineering Society" }];
  expect(orderEvents(events).map(e => e.name || e.title)).toEqual(["Old CSE event", "Other 1", "Other 2"]);
});

test("bundled registration and catalogue data start with SDC and CSES", () => {
  const events = getFallbackEvents();
  expect(events[0].name).toBe("SDC Games");
  expect(events.slice(1, 3).every(e => e.club === "CSE Society")).toBe(true);
});
