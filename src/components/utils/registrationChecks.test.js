import { isNitwEmail, isValidNitwRollNumber, normalizeRollNumber } from "./registrationChecks";

test("normalizes roll numbers without dropping leading zeroes", () => {
  expect(normalizeRollNumber(" 00123ab ")).toBe("00123AB");
  expect(isValidNitwRollNumber("00123456")).toBe(true);
});

test("rejects empty, numeric and malformed roll numbers", () => {
  for (const value of [undefined, "", 123456, "a b", "<script>", "a".repeat(33)]) {
    expect(isValidNitwRollNumber(value)).toBe(false);
  }
});

test("NITW classification accepts its student subdomains", () => {
  expect(isNitwEmail("student@student.nitw.ac.in")).toBe(true);
  expect(isNitwEmail("outside@example.com")).toBe(false);
  expect(isNitwEmail("outside@nitw.ac.in.example.com")).toBe(false);
});
