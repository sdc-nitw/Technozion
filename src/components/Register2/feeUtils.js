export const normalizeStudentType = (value) => {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (["nitw", "nitw-student"].includes(normalized)) return "nitw";
  if (["external", "other", "non-nitw", "nonnitw", "other-institution"].includes(normalized)) return "external";

  return normalized || "external";
};

export function isCompetitionEvent(event) {
  if (!event) return false;
  const type = String(event.eventType || event.type || event.category || "").toLowerCase();
  return /competition/.test(type);
}

export function countExternalParticipants({ isNitwLead = false, members = [] } = {}) {
  const validMembers = Array.isArray(members) ? members : [];
  let count = isNitwLead ? 0 : 1;
  validMembers.forEach((member) => {
    if (!member || typeof member !== "object") return;
    const normalizedType = normalizeStudentType(member.studentType);
    if (normalizedType !== "nitw") count++;
  });
  return count;
}

export function computeRegistrationFee({
  isNitwLead = false,
  members = [],
  selectedEventIds = [],
  events = [],
} = {}) {
  const GATE_FEE = 200;
  const COMPETITION_FEE = 500;
  const MAX_FEE = 2000;

  const externalCount = countExternalParticipants({ isNitwLead, members });

  if (externalCount === 0) {
    return {
      externalCount: 0,
      total: 0,
      mode: null,
      competitionCount: 0,
      requiresPayment: false,
    };
  }

  const validEvents = Array.isArray(events) ? events : [];
  const selectedIds = Array.isArray(selectedEventIds) ? selectedEventIds : [];

  const comps = validEvents.filter(
    (e) =>
      selectedIds.includes(e._id || e.slug) &&
      isCompetitionEvent(e)
  ).length;

  if (comps > 0) {
    const total = Math.min(COMPETITION_FEE * comps, MAX_FEE);
    return {
      externalCount,
      total,
      mode: "competition",
      competitionCount: comps,
      requiresPayment: true,
    };
  }

  if (selectedIds.length > 0) {
    const total = Math.min(GATE_FEE * externalCount, MAX_FEE);
    return {
      externalCount,
      total,
      mode: "gate",
      competitionCount: 0,
      requiresPayment: true,
    };
  }

  return {
    externalCount,
    total: 0,
    mode: null,
    competitionCount: 0,
    requiresPayment: false,
  };
}

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