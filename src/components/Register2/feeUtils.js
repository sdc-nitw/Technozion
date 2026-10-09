export function getChargeableGateMembers({
  isNitwLead = false,
  members = [],
  teamSize = 4,
} = {}) {
  const chargeableParticipants = [];

  if (!isNitwLead) {
    chargeableParticipants.push({ name: "lead", studentType: "external" });
  }

  const validMembers = Array.isArray(members) ? members : [];
  validMembers.forEach((member) => {
    if (!member || typeof member !== "object") return;
    const name = typeof member.name === "string" ? member.name.trim() : "";
    if (!name) return;
    if (member.studentType === "nitw") return;
    chargeableParticipants.push(member);
  });

  return Math.min(chargeableParticipants.length, teamSize);
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
