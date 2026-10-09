const { test, expect } = require("@playwright/test");
const events = [
  ["Impact Tank", "Competition", "impact_tank.jpg"], ["Smash Karts", "Competition", "Smash-Karts.png"],
  ["SDC Games", "Game", "SDC_GAMES.jpg"], ["Air Hockey", "Game", "Airhockey.png"],
  ["Hover Craft", "Demonstration", "Hover-Craft.jpg"], ["Vehicle Demonstration", "Demonstration", "VEHICLE_DEMONSTRATION.jpg"],
].map(([name, eventType, poster], i) => ({ _id: "test-" + i, slug: "test-" + i, name, eventType, imgsrc: "/posters26/" + poster, club: "TECHNOZION", description: "Build, experiment and challenge your ideas at NIT Warangal.", teamSize: "3", rules: ["Follow the event guidelines."] }));

test.beforeEach(async ({ page }) => {
  await page.route("**/*", async route => {
    const url = new URL(route.request().url());
    if (url.pathname === "/api/events") return route.fulfill({ json: events });
    if (url.hostname !== "127.0.0.1") return route.abort();
    if (url.pathname === "/pdf/tz.pdf") return route.abort();
    return route.continue();
  });
});
async function ready(page, path = "/") {
  await page.goto(path);
  await expect(page.locator(".site-header")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}
async function jump(page, top) {
  await page.evaluate(top => window.scrollTo({ top, behavior: "instant" }), top);
  await page.waitForTimeout(850);
}
async function journeyRange(page) {
  return page.locator(".event-showcase").evaluate(el => ({ start: el.getBoundingClientRect().top + window.scrollY - 104, travel: el.querySelector(".showcase-track").scrollWidth - el.querySelector(".showcase-stage").clientWidth }));
}

test("desktop pins, reverses, releases, and cleans up across route navigation", async ({ page }) => {
  const errors = []; page.on("pageerror", e => errors.push(e.message));
  await ready(page);
  await expect(page.locator(".showcase-stage[data-pinned]")).toHaveCount(1);
  await expect(page.locator(".pin-spacer")).toHaveCount(2);
  await page.screenshot({ path: "/tmp/technozion-scroll-opening.png" });
  await jump(page, 450);
  await page.screenshot({ path: "/tmp/technozion-scroll-hero-mid.png" });
  const { start, travel } = await journeyRange(page);
  await jump(page, start + travel / 2);
  await expect(page.locator(".showcase-stage")).toHaveCSS("position", "fixed");
  await page.screenshot({ path: "/tmp/technozion-scroll-events-mid.png" });
  const middle = await page.locator(".showcase-track").evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m41);
  await jump(page, start + 30);
  const reversed = await page.locator(".showcase-track").evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m41);
  expect(reversed).toBeGreaterThan(middle);
  await jump(page, start + travel);
  await page.screenshot({ path: "/tmp/technozion-scroll-events-last.png" });
  await jump(page, start + travel + 700);
  await expect(page.locator(".showcase-stage")).not.toHaveCSS("position", "fixed");
  await page.locator(".festival-invitation").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "/tmp/technozion-scroll-closing.png" });
  await page.locator('.festival-invitation a[href="/register"]').click();
  await expect(page.locator(".registration-page")).toBeVisible();
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await page.getByRole("button", { name: "Close registration" }).click();
  await page.locator('.site-header a[href="/"]').last().click();
  await expect(page.locator(".pin-spacer")).toHaveCount(2);
  expect(errors).toEqual([]);
});

test("keyboard controls and offscreen event focus bring chapters into view", async ({ page }) => {
  await ready(page);
  await expect(page.locator(".showcase-stage[data-pinned]")).toHaveCount(1);
  const { start } = await journeyRange(page);
  await jump(page, start + 1);
  await page.getByRole("button", { name: "Next featured event" }).click();
  await page.waitForTimeout(1100);
  await expect(page.locator('.event-chapter[data-active="true"]')).toContainText("Impact Tank");
  await page.locator(".chapter-detail").last().focus();
  await page.waitForTimeout(1100);
  await expect(page.locator('.event-chapter[data-active="true"]')).toContainText("Vehicle Demonstration");
  await expect(page.locator(".chapter-detail").last()).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator(".event_card")).toBeVisible();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.locator(".hero-pin")).toBeVisible();
});

test("mobile uses vertical chapters, opens navigation, and stays within the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page);
  await expect(page.locator(".event-chapter")).toHaveCount(6);
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await page.screenshot({ path: "/tmp/technozion-scroll-mobile.png" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  const positions = await page.locator(".event-chapter").evaluateAll(items => items.map(el => el.getBoundingClientRect().top));
  expect(positions[1]).toBeGreaterThan(positions[0]);
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await page.locator('.site-header a[href="/events"]').click();
  await expect(page.locator(".festival-events")).toBeVisible();
  await expect(page.getByRole("button", { name: "Open navigation menu" })).toBeVisible();
});

test("reduced motion and short desktop viewports never pin", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  await expect(page.locator(".event-chapter")).toHaveCount(6);
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.locator("html")).not.toHaveClass(/lenis/);
  await expect(page.locator(".statement-title")).toHaveText("INNOVATION BEYOND BOUNDARIES.");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator("html")).toHaveClass(/lenis/);
  await expect(page.locator(".pin-spacer")).toHaveCount(2);
  await page.setViewportSize({ width: 1440, height: 650 });
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
});

test("wheel scrolling uses Lenis, prioritizes events, resets routes and keeps the slogan under the brand", async ({ page }) => {
  const priorityEvents = [...events,
    { ...events[0], _id: "cses", name: "CSES Arcade", club: "CSE Society" },
    { ...events[1], _id: "cses-ai", name: "AI Unveiled", club: "CSE Society" },
  ];
  await page.route("**/api/events", route => route.fulfill({ json: priorityEvents }));
  await ready(page);
  await expect(page.locator("html")).toHaveClass(/lenis/);
  await expect(page.locator(".event-chapter").first()).toContainText("SDC Games");
  await expect(page.locator(".event-chapter").nth(1)).toContainText("CSES Arcade");
  expect(await page.locator(".hero-display").evaluate(el => +getComputedStyle(el).zIndex)).toBeLessThan(await page.locator(".hero-brand-reveal").evaluate(el => +getComputedStyle(el).zIndex));
  await page.mouse.wheel(0, 600);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
  await page.mouse.wheel(0, -600);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(10);
  await page.locator('.site-header a[href="/events"]').click();
  await expect(page.locator(".catalogue-item").first()).toContainText("SDC Games");
  await expect(page.locator(".catalogue-item").nth(1)).toContainText("CSES Arcade");
  await page.locator('.site-header a[href="/register"]').click();
  await expect(page.locator(".registration-page")).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5);
  const choices = page.locator('input[name="events"]');
  await expect(choices).toHaveCount(priorityEvents.length);
  await expect(choices.first()).toHaveValue("test-2");
  await expect(choices.nth(1)).toHaveValue("cses");
});

test("Events opens directly to the catalogue and filters without a sliding journey", async ({ page }) => {
  await ready(page, "/events");
  await expect(page.locator(".catalogue-item")).toHaveCount(6);
  await expect(page.locator(".event-showcase")).toHaveCount(0);
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.locator(".catalogue-heading")).toBeInViewport();
  await page.screenshot({ path: "/tmp/technozion-events-catalogue.png" });
  await page.getByRole("button", { name: "GAMES", exact: true }).click();
  await expect(page.locator(".catalogue-item")).toHaveCount(2);
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await page.locator(".catalogue-item").first().click();
  await expect(page.locator(".event_card")).toBeVisible();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.locator(".festival-events")).toBeVisible();
  await ready(page, "/events#event-catalogue");
  await expect.poll(() => page.locator("#event-catalogue").evaluate(el => el.getBoundingClientRect().top)).toBeLessThan(160);
});

test("a single featured poster skips journey pinning and failed artwork remains usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/api/events", route => route.fulfill({ json: [{ ...events[0], imgsrc: "/posters26/missing-test-poster.png" }, { ...events[1], imgsrc: "" }] }));
  await ready(page);
  await expect(page.locator(".event-chapter")).toHaveCount(1);
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.locator(".chapter-art-fallback")).toBeVisible();
  await page.locator(".chapter-detail").click();
  await expect(page.locator(".event_card")).toBeVisible();
});

test("festival date and countdown stay prominent and opening links clear the pin", async ({ page }) => {
  await ready(page);
  await expect(page.locator(".hero-date")).toHaveText("30–31OCTOBER2026");
  await expect(page.locator(".time-box")).toHaveCount(4);
  await expect(page.locator(".hero-scene-top")).toHaveCount(0);
  for (const selector of [".hero-date", ".hero-countdown"]) {
    const box = await page.locator(selector).boundingBox();
    expect(box.y + box.height).toBeLessThanOrEqual(900);
  }
  await page.getByRole("link", { name: "Scroll to explore", exact: true }).click();
  await expect.poll(() => page.locator("#festival-statement").evaluate(el => el.getBoundingClientRect().top)).toBeLessThan(130);
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page);
  await page.locator(".hero-date").scrollIntoViewIfNeeded();
  await expect(page.locator(".hero-date")).toBeInViewport();
  await expect(page.locator(".hero-countdown")).toBeInViewport({ ratio: 1 });
  await page.screenshot({ path: "/tmp/technozion-scroll-mobile-countdown.png" });
  const cubeBounds = await page.locator(".core-cube").boundingBox();
  const sloganBounds = await page.locator(".hero-slogan").boundingBox();
  expect(cubeBounds.y + cubeBounds.height).toBeLessThan(sloganBounds.y);
  await page.setViewportSize({ width: 320, height: 844 });
  await ready(page);
  expect(await page.locator(".hero-slogan").evaluate(el => el.getBoundingClientRect().right <= window.innerWidth)).toBeTruthy();
  await expect(page.locator(".hero-countdown")).toBeInViewport({ ratio: 1 });
});

test("the closing guide exposes the brochure and official contact links", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  await page.locator("#brochure").scrollIntoViewIfNeeded();
  await expect(page.getByRole("link", { name: "Read the brochure", exact: true })).toHaveAttribute("href", "/pdf/tz.pdf");
  await expect(page.getByRole("link", { name: "Download PDF", exact: true })).toHaveAttribute("download", "Technozion-2026-Brochure.pdf");
  await expect(page.locator('a[href="mailto:sec_technical@nitw.ac.in"]')).toBeVisible();
  await expect(page.locator(".coordinator-list a")).toHaveCount(4);
  await expect(page.getByRole("link", { name: "Instagram", exact: true })).toHaveAttribute("href", "https://www.instagram.com/technozion_nitw/");
  await page.screenshot({ path: "/tmp/technozion-brochure-resources.png" });
  const pdf = await page.request.head("/pdf/tz.pdf");
  expect(pdf.ok()).toBeTruthy();
  expect(pdf.headers()["content-type"]).toContain("application/pdf");
});

test("slow event fetching shares requests across navigation and cached lists appear immediately", async ({ page }) => {
  let release;
  let requests = 0;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route("**/api/events", async route => {
    requests += 1;
    await gate;
    await route.fulfill({ json: events });
  });
  try {
    await ready(page, "/events");
    await expect(page.getByRole("status", { name: "Loading events" })).toBeVisible();
    await expect(page.locator(".event-placeholder")).toHaveCount(10);
    await page.screenshot({ path: "/tmp/technozion-events-loading.png" });
    await page.locator('.site-header a[href="/register"]').click();
    await expect(page.locator(".registration-modal")).toBeVisible();
    expect(requests).toBe(1);
    release();
    await expect(page.locator('input[name="events"]')).toHaveCount(events.length);
    await page.getByRole("button", { name: "Close registration" }).click();
    await page.locator('.site-header a[href="/events"]').click();
    await expect(page.locator(".catalogue-item")).toHaveCount(events.length);
    await expect(page.getByRole("status", { name: "Loading events" })).toHaveCount(0);
    await page.locator('.site-header a[href="/"]').last().click();
    await expect(page.locator(".event-chapter")).toHaveCount(events.length);
    await expect(page.getByRole("status", { name: "Loading events" })).toHaveCount(0);
    expect(requests).toBe(1);
  } finally {
    release();
  }
});
