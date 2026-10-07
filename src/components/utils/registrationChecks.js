const NITW_DOMAIN = "nitw.ac.in";

export const normalizeRollNumber = (value) =>
  typeof value === "string" ? value.trim().toUpperCase() : "";

export const isValidNitwRollNumber = (value) =>
  /^[A-Z0-9-]{3,32}$/.test(normalizeRollNumber(value));

export const isNitwEmail = (email) => {
  if (typeof email !== "string") return false;
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2 || !parts[0]) return false;
  const domain = parts[1];
  return domain === NITW_DOMAIN || domain.endsWith("." + NITW_DOMAIN);
};
