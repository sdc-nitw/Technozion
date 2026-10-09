/* eslint testing-library/no-unnecessary-act: "off" -- These tests use React DOM directly, which requires act. */
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import AuthProvider, { useAuth } from "./AuthManager";

const mockNavigate = jest.fn();
const mockNotify = jest.fn();
jest.mock("react-router-dom", () => ({ useNavigate: () => mockNavigate }));
jest.mock("./SnackbarProvider", () => ({ useSnackbar: () => ({ notify: mockNotify }) }));
jest.mock("../components/Loader", () => ({ Loader: () => null }));

let container;
let root;
const originalFetch = global.fetch;
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  localStorage.clear();
  global.fetch = jest.fn();
  mockNavigate.mockClear();
  mockNotify.mockClear();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  global.fetch = originalFetch;
  delete global.IS_REACT_ACT_ENVIRONMENT;
});

const mountSubmit = async (data) => {
  const Submit = () => {
    const { register } = useAuth();
    return <button onClick={() => register(data)}>Submit</button>;
  };
  await act(async () => root.render(<AuthProvider><Submit /></AuthProvider>));
  await act(async () => container.querySelector("button").click());
};

test("registration forwards NITW roll and all member identities and shows server-issued IDs", async () => {
  const teamMembers = [
    { name: "NITW Member", studentType: "nitw", rollNumber: "00123457" },
    { name: "External Member", studentType: "external" },
  ];
  const participants = [
    { name: "Lead", participantId: "00123456", rollNumber: "00123456", studentType: "nitw" },
    { name: "External Member", participantId: "26TZ0123456789ABCDEF", studentType: "external", rollNumber: null },
  ];
  global.fetch
    .mockResolvedValueOnce({ ok: true, json: async () => ({ secure_url: "https://example.com/test-id.png" }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ email: "test@nitw.ac.in", participants }) });
  await mountSubmit({
    name: "Lead", email: "test@nitw.ac.in", rollNumber: " 00123456 ", password: "test-password",
    registrationType: "team", teamMembers, idDocument: new File(["test fixture"], "id.png", { type: "image/png" }),
  });
  const payload = JSON.parse(global.fetch.mock.calls[1][1].body);
  expect(payload.rollNumber).toBe("00123456");
  expect(payload.teamMembers).toEqual(teamMembers);
  expect(payload.participantId).toBeUndefined();
  expect(mockNavigate).toHaveBeenCalledWith("/registration-complete", { state: { verifyEmail: "test@nitw.ac.in", participants } });
});

test("missing NITW roll is rejected before uploads or registration requests", async () => {
  await mountSubmit({ email: "test@nitw.ac.in" });
  expect(global.fetch).not.toHaveBeenCalled();
  expect(mockNotify).toHaveBeenCalledWith("Please enter your NITW roll number.", { variant: "error" });
});
