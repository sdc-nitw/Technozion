let data;
let now;
const apiEvents = [{ _id: "api-1", name: "SDC Games", eventType: "Game", imgsrc: "/poster.jpg", registrationOpen: true }];
const response = events => ({ ok: true, json: async () => events });
let originalFetch;

beforeEach(() => {
  jest.resetModules();
  jest.useFakeTimers();
  now = 1000;
  jest.spyOn(Date, "now").mockImplementation(() => now);
  jest.spyOn(console, "warn").mockImplementation(() => {});
  originalFetch = global.fetch;
  global.fetch = jest.fn();
  data = require("./eventsData");
});
afterEach(() => {
  global.fetch = originalFetch;
  jest.restoreAllMocks();
  jest.useRealTimers();
});

test("concurrent consumers share one request and fresh navigation uses the cache", async () => {
  let complete;
  global.fetch.mockReturnValue(new Promise(resolve => { complete = resolve; }));
  const home = data.fetchEvents();
  const catalogue = data.fetchEvents();
  expect(catalogue).toBe(home);
  expect(global.fetch).toHaveBeenCalledTimes(1);
  complete(response({ events: apiEvents }));
  const events = await home;
  expect(events).toEqual(apiEvents);
  expect(data.getCachedEvents()).toBe(events);
  expect(await data.fetchEvents()).toBe(events);
  expect(global.fetch).toHaveBeenCalledTimes(1);
});

test("expired data remains available during a refresh and changed API data replaces it", async () => {
  global.fetch.mockResolvedValueOnce(response(apiEvents));
  const old = await data.fetchEvents();
  now += 60001;
  let complete;
  global.fetch.mockReturnValueOnce(new Promise(resolve => { complete = resolve; }));
  const refresh = data.fetchEvents();
  expect(data.getCachedEvents()).toBe(old);
  const updated = [{ ...apiEvents[0], registrationOpen: false }];
  complete(response(updated));
  expect(await refresh).toEqual(updated);
  expect(global.fetch).toHaveBeenCalledTimes(2);
});

test("identical refreshes preserve the reference used by pinned animations", async () => {
  global.fetch.mockImplementation(async () => response(JSON.parse(JSON.stringify(apiEvents))));
  const events = await data.fetchEvents();
  now += 60001;
  expect(await data.fetchEvents()).toBe(events);
});

test("a failed refresh keeps API IDs and backs off before retrying", async () => {
  global.fetch.mockResolvedValueOnce(response(apiEvents)).mockRejectedValueOnce(new Error("offline"));
  const events = await data.fetchEvents();
  now += 60001;
  expect(await data.fetchEvents()).toBe(events);
  expect(await data.fetchEvents()).toBe(events);
  expect(global.fetch).toHaveBeenCalledTimes(2);
  now += 15001;
  global.fetch.mockResolvedValueOnce(response(apiEvents));
  await data.fetchEvents();
  expect(global.fetch).toHaveBeenCalledTimes(3);
});

test.each([[], { events: [null, 42, {}] }, { unexpected: true }])("empty or malformed API data uses the fallback and can recover: %j", async invalid => {
  global.fetch.mockResolvedValueOnce(response(invalid));
  expect(await data.fetchEvents()).toBe(data.getFallbackEvents());
  now += 15001;
  global.fetch.mockResolvedValueOnce(response(apiEvents));
  expect(await data.fetchEvents()).toEqual(apiEvents);
});

test("a timed-out request releases the shared request and later retries", async () => {
  global.fetch.mockImplementationOnce((url, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener("abort", () => reject(new Error("aborted")));
  }));
  const request = data.fetchEvents();
  jest.advanceTimersByTime(6000);
  expect(await request).toBe(data.getFallbackEvents());
  now += 15001;
  global.fetch.mockResolvedValueOnce(response(apiEvents));
  expect(await data.fetchEvents()).toEqual(apiEvents);
});
