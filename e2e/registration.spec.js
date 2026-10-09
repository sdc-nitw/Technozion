const { test, expect } = require("@playwright/test");

const events = [
  { _id: "000000000000000000000001", slug: "sdc-games", name: "SDC Games", club: "Software Development Club", eventType: "Game" },
  { _id: "000000000000000000000002", slug: "impact-tank", name: "Impact Tank", club: "TECHNOZION", eventType: "Competition" },
];
const proof = { name: "test-id.pdf", mimeType: "application/pdf", buffer: Buffer.from("test-only document") };
const payment = { name: "test-payment.png", mimeType: "image/png", buffer: Buffer.from("test-only screenshot") };

async function setup(page) {
  const state = { payload: null, registrations: 0, uploads: 0, otpRequests: 0, failRegistration: false };
  await page.route("**/*", async route => {
    const url = new URL(route.request().url());
    if (url.pathname === "/api/events") return route.fulfill({ json: events });
    if (/\/api\/auth\/(?:send|verify)-otp$/.test(url.pathname)) {
      state.otpRequests += 1;
      return route.fulfill({ status: 500, json: { message: "OTP must not be used" } });
    }
    if (url.hostname === "api.cloudinary.com") {
      state.uploads += 1;
      return route.fulfill({ json: { secure_url: `https://example.com/test-upload-${state.uploads}` } });
    }
    if (url.pathname === "/api/auth/register") {
      state.registrations += 1;
      state.payload = route.request().postDataJSON();
      if (state.failRegistration) {
        state.failRegistration = false;
        return route.fulfill({ status: 409, json: { message: "A team member is already registered. Check your team details." } });
      }
      return route.fulfill({ status: 201, json: {
        email: state.payload.email, message: "Registration received", participants: [
          { name: state.payload.name, participantId: state.payload.rollNumber || "26TZTEST", studentType: state.payload.rollNumber ? "nitw" : "external", rollNumber: state.payload.rollNumber },
          ...state.payload.teamMembers.map((member, index) => ({ ...member, participantId: member.rollNumber || `26TZ000${index}` })),
        ],
      } });
    }
    if (url.hostname !== "127.0.0.1") return route.abort();
    return route.continue();
  });
  await page.goto("/register");
  await expect(page.getByRole("dialog")).toBeVisible();
  return state;
}

async function lead(page, email = "test@example.com") {
  await page.getByRole("textbox", { name: "Full name", exact: true }).fill("Test Lead");
  await page.getByLabel("Gender", { exact: true }).selectOption("other");
  await page.getByRole("textbox", { name: "Email address", exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill("test-only-password");
  await page.getByRole("textbox", { name: "College / University", exact: true }).fill("Test College");
}
const next = page => page.getByRole("button", { name: "Continue", exact: true }).click();
const heading = page => page.locator("#registration-dialog-title");

test("outsiders complete a single modal, retain files and teammates, and submit only after review", async ({ page }) => {
  const state = await setup(page);
  await next(page);
  await expect(heading(page)).toHaveText("Team lead.");
  await expect(page.getByText("Lead name is required", { exact: true })).toBeVisible();
  await lead(page);
  await next(page);
  await expect(heading(page)).toHaveText("Your team.");
  await next(page);
  await expect(page.getByText("Member name is required", { exact: true })).toHaveCount(3);
  for (let member = 2; member <= 4; member++) await page.getByRole("textbox", { name: `Member ${member} name`, exact: true }).fill(`Test Member ${member}`);
  await page.locator("#member-0-institution").selectOption("nitw");
  await page.locator("#member-0-roll").fill("00123456");
  await next(page);
  await expect(heading(page)).toHaveText("Your events.");
  await next(page);
  await expect(page.getByText("Choose at least one event", { exact: true })).toBeVisible();
  await page.getByText("SDC Games", { exact: true }).click();
  await next(page);
  await expect(heading(page)).toHaveText("Identity proof.");
  await next(page);
  await expect(page.getByText("ID proof is required", { exact: true })).toBeVisible();
  await page.locator("#college-id").setInputFiles(proof);
  await next(page);
  await expect(heading(page)).toHaveText("Payment.");
  await expect(page.getByText("62046706567", { exact: true })).toBeVisible();
  await expect(page.locator(".registration-step:not([hidden])").getByText("₹600", { exact: true })).toBeVisible();
  await next(page);
  await expect(page.getByText("Payment screenshot is required", { exact: true })).toBeVisible();
  await page.locator("#payment-screenshot").setInputFiles(payment);
  await next(page);
  await expect(heading(page)).toHaveText("Review & submit.");
  await expect(page.locator(".registration-review")).toContainText("00123456");
  await expect(page.locator(".registration-review")).toContainText("test-payment.png");
  await page.getByRole("button", { name: "Edit documents", exact: true }).click();
  expect(await page.locator("#college-id").evaluate(element => element.files[0].name)).toBe("test-id.pdf");
  await page.getByRole("button", { name: "Close registration" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Continue registration" }).click();
  await expect(heading(page)).toHaveText("Identity proof.");
  await next(page);
  expect(await page.locator("#payment-screenshot").evaluate(element => element.files[0].name)).toBe("test-payment.png");
  await next(page);
  await expect.poll(() => page.locator(".registration-review").evaluate(element => getComputedStyle(element).opacity)).toBe("1");
  await page.screenshot({ path: "/tmp/technozion-registration-modal-review.png" });
  expect(state.registrations).toBe(0);
  state.failRegistration = true;
  await page.getByRole("button", { name: "Submit registration", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "A team member is already registered." })).toBeVisible();
  await expect(heading(page)).toHaveText("Review & submit.");
  await page.getByRole("button", { name: "Submit registration", exact: true }).click();
  await expect(page).toHaveURL(/registration-complete/);
  expect(state.registrations).toBe(2);
  expect(state.uploads).toBe(4);
  expect(state.otpRequests).toBe(0);
  expect(state.payload.teamMembers[0]).toEqual({ name: "Test Member 2", studentType: "nitw", rollNumber: "00123456" });
  expect(state.payload.events).toEqual([events[0]._id]);
  expect(state.payload.paymentScreenshotUrl).toBe("https://example.com/test-upload-4");
  await expect(page.getByText("26TZTEST", { exact: true })).toBeVisible();
});

test("mobile NITW registration skips payment, keeps rolls and traps focus in the dialog", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const state = await setup(page);
  await page.screenshot({ path: "/tmp/technozion-registration-modal-mobile.png" });
  expect(await page.locator(".registration-modal").evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.keyboard.press("Shift+Tab");
  expect(await page.evaluate(() => Boolean(document.activeElement.closest("dialog")))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Start registration" }).click();
  await lead(page, "test@student.nitw.ac.in");
  await page.locator("#leader-roll-number").fill("00112233");
  await next(page);
  for (let member = 2; member <= 4; member++) {
    await page.getByRole("textbox", { name: `Member ${member} name`, exact: true }).fill(`Test Member ${member}`);
    await page.locator(`#member-${member - 2}-institution`).selectOption("nitw");
    await page.locator(`#member-${member - 2}-roll`).fill(`00${member}1122`);
  }
  await next(page);
  await page.getByText("Impact Tank", { exact: true }).click();
  await next(page);
  await page.locator("#college-id").setInputFiles(proof);
  await next(page);
  await expect(heading(page)).toHaveText("Review & submit.");
  await expect(page.getByText("NITW registration · payment exempt", { exact: true })).toBeVisible();
  await expect(page.locator("#payment-screenshot")).toHaveCount(0);
  expect(state.registrations).toBe(0);
  await expect(page.getByRole("button", { name: "Submit registration", exact: true })).toBeInViewport();
  await expect.poll(() => page.locator(".registration-review").evaluate(element => getComputedStyle(element).opacity)).toBe("1");
  await page.screenshot({ path: "/tmp/technozion-registration-modal-mobile-review.png" });
  await page.getByRole("button", { name: "Submit registration", exact: true }).click();
  await expect(page).toHaveURL(/registration-complete/);
  expect(state.payload.rollNumber).toBe("00112233");
  expect(state.payload.teamMembers).toHaveLength(3);
  expect(state.payload.teamMembers[0].studentType).toBe("nitw");
  expect(state.payload.teamMembers[1].studentType).toBe("nitw");
  expect(state.payload.teamMembers[2].studentType).toBe("nitw");
  expect(state.payload.paymentScreenshotUrl).toBeNull();
  expect(state.uploads).toBe(1);
  expect(state.otpRequests).toBe(0);
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
});
