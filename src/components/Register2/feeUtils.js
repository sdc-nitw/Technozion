export const normalizeStudentType = (value) => {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (["nitw", "nitw-student"].includes(normalized)) return "nitw";
  if (["external", "other", "non-nitw", "nonnitw", "other-institution"].includes(normalized)) return "external";

  return normalized || "external";
};

export function getChargeableGateMembers({
  isNitwLead = false,
  members = [],
  teamSize = 4,
} = {}) {
  const chargeableParticipants = new Map();

  if (!isNitwLead) {
    chargeableParticipants.set("lead", { name: "lead", studentType: "external" });
  }

  const validMembers = Array.isArray(members) ? members : [];
  validMembers.forEach((member) => {
    if (!member || typeof member !== "object") return;

    const name = typeof member.name === "string" ? member.name.trim() : "";
    if (!name) return;

    const normalizedType = normalizeStudentType(member.studentType);
    if (normalizedType === "nitw") return;

    const key = `${name.toLowerCase()}|${normalizedType}`;
    if (!chargeableParticipants.has(key)) {
      chargeableParticipants.set(key, { ...member, name, studentType: normalizedType });
    }
  });

  const count = chargeableParticipants.size;
  const safeTeamSize = Number.isFinite(teamSize) && teamSize > 0 ? teamSize : 0;
  return Math.min(count, safeTeamSize || count);
}

export function groupRegistrationEvents(events = []) {
  const groups = [
    { key: "competitions", label: "Competitions", events: [] },
    { key: "games", label: "Games", events: [] },
    { key: "other", label: "Demonstrations & Other Events", events: [] },
  ];

  const normalized = Array.isArray(events) ? events : [];

  normalized.forEach((event) => {
    const type = (event?.eventType || event?.type || event?.category || "").toString().toLowerCase();

    if (/competition/.test(type)) {
      groups[0].events.push(event);
    } else if (/game/.test(type)) {
      groups[1].events.push(event);
    } else {
      groups[2].events.push(event);
    }
  });

  return groups.filter((group) => group.events.length > 0);
}
