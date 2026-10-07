import { correctEventPoster } from "./eventsData";

test("removes the Bid to Build poster incorrectly assigned to FinWiz", () => {
  const event = {
    name: "Warangal Trading Ring 2.0",
    imgsrc: "/posters26/bid_to_build.jpeg",
    poster: "https://example.com/posters26/bid_to_build.jpeg?v=1",
    image: "/posters26/bid_to_build.jpeg",
  };
  expect(correctEventPoster(event)).toEqual({
    ...event,
    imgsrc: "",
    poster: "",
    image: "",
  });
  expect(event.imgsrc).toBe("/posters26/bid_to_build.jpeg");
});

test("preserves Bid to Build's own poster", () => {
  const event = { name: "Bid to Build", imgsrc: "/posters26/bid_to_build.jpeg" };
  expect(correctEventPoster(event)).toEqual(event);
});

test("preserves a correct FinWiz poster and an empty poster assignment", () => {
  for (const imgsrc of ["/posters26/warangal_trading_ring.jpeg", null]) {
    const event = { name: "Warangal Trading Ring 2.0", imgsrc };
    expect(correctEventPoster(event)).toEqual(event);
  }
});