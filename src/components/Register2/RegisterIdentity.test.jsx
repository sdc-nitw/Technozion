/* eslint testing-library/no-unnecessary-act: "off" -- These tests use React DOM directly, which requires act. */
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { Simulate } from "react-dom/test-utils";
import Register from "./Register";
import { fetchEvents } from "../Events/eventsData";

jest.mock("../../Context/AuthManager", () => ({ useAuth: () => ({ register: jest.fn(), loading: false }) }));
jest.mock("../Events/eventsData", () => ({ fetchEvents: jest.fn(), getCachedEvents: () => null }));
jest.mock("../bg_animation/bg_animate", () => ({ WebCanvas: () => null }));

let root;
let container;
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
  global.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  fetchEvents.mockResolvedValue([]);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  delete global.IS_REACT_ACT_ENVIRONMENT;
});

const mountRegister = async () => { await act(async () => root.render(<Register />)); };
const change = async (field, value) => {
  await act(async () => {
    field.value = value;
    Simulate.change(field);
  });
};

test("only a NITW lead sees the roll number field", async () => {
  await mountRegister();
  expect(container.querySelector('#leader-roll-number')).toBeNull();
  const email = container.querySelector('[name="email"]');
  await change(email, "test@student.nitw.ac.in");
  expect(container.querySelector('#leader-roll-number')).not.toBeNull();
  await change(email, "test@example.com");
  expect(container.querySelector('#leader-roll-number')).toBeNull();
});

test("each teammate can independently select NITW and supply a roll number", async () => {
  await mountRegister();
  const institution = container.querySelector('#member-0-institution');
  await change(institution, "nitw");
  expect(container.querySelector('#member-0-roll')).not.toBeNull();
  expect(container.querySelector('#member-1-roll')).toBeNull();
  await change(container.querySelector('#member-0-roll'), "00123456");
  await change(institution, "external");
  expect(container.querySelector('#member-0-roll')).toBeNull();
  expect(container.querySelectorAll('[aria-label^="Member "][aria-label$=" name"]')).toHaveLength(3);
});
