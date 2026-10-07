/* eslint testing-library/no-unnecessary-act: "off" -- React DOM rendering requires act. */
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { Simulate } from "react-dom/test-utils";
import DepthSurface from "./DepthSurface";

let root, container, surface, frames, nextFrame, preferenceListener, reduced;
const originalMatchMedia = window.matchMedia;

beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  frames = new Map();
  nextFrame = 0;
  reduced = false;
  window.matchMedia = jest.fn(() => ({
    matches: reduced,
    addEventListener: (_, listener) => { preferenceListener = listener; },
    removeEventListener: jest.fn(),
  }));
  jest.spyOn(window, "requestAnimationFrame").mockImplementation(callback => {
    const id = ++nextFrame;
    frames.set(id, callback);
    return id;
  });
  jest.spyOn(window, "cancelAnimationFrame").mockImplementation(id => frames.delete(id));
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(<DepthSurface><span>Content</span></DepthSurface>));
  surface = container.firstChild;
  surface.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 200 });
});

afterEach(() => {
  if (root) act(() => root.unmount());
  container.remove();
  jest.restoreAllMocks();
  window.matchMedia = originalMatchMedia;
  delete global.IS_REACT_ACT_ENVIRONMENT;
});

const move = (pointerType = "mouse", clientX = 180, clientY = 20) => {
  act(() => Simulate.pointerMove(surface, { pointerType, clientX, clientY }));
};
const flushFrame = () => {
  const callbacks = [...frames.values()];
  frames.clear();
  act(() => callbacks.forEach(callback => callback()));
};

test("coalesces pointer motion into one frame and resets on leave", () => {
  move();
  move("mouse", 150, 60);
  expect(frames.size).toBe(1);
  expect(surface.style.getPropertyValue("--tilt-x")).toBe("");
  flushFrame();
  expect(surface.style.getPropertyValue("--tilt-x")).not.toBe("");
  expect(surface.style.getPropertyValue("--pointer-x")).toBe("75.0%");
  act(() => Simulate.pointerLeave(surface));
  expect(surface.style.getPropertyValue("--tilt-x")).toBe("");
  expect(surface.style.getPropertyValue("--pointer-x")).toBe("");
});

test("touch and reduced-motion preferences prevent tilt updates", () => {
  move("touch");
  expect(frames.size).toBe(0);
  reduced = true;
  move();
  expect(frames.size).toBe(0);
});

test("changing the motion preference clears existing tilt and pending work", () => {
  move();
  flushFrame();
  move();
  expect(frames.size).toBe(1);
  reduced = true;
  act(() => preferenceListener());
  expect(frames.size).toBe(0);
  expect(surface.style.getPropertyValue("--tilt-y")).toBe("");
});

test("unmount cancels a pending animation frame", () => {
  move();
  expect(frames.size).toBe(1);
  act(() => root.unmount());
  root = null;
  expect(frames.size).toBe(0);
});
