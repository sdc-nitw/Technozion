export function getChargeableGateMembers({
  isNitwLead = false,
  members = [],
  teamSize = 4,
} = {}) {
  const namedMembers = Array.isArray(members)
    ? members.filter(
        (member) => member && typeof member.name === "string" && member.name.trim()
      )
    : [];

  const participants = [
    ...(isNitwLead ? [] : [{ name: "lead", studentType: "external" }]),
    ...namedMembers,
  ];

  const nitwCount = participants.filter(
    (participant) => participant && participant.studentType === "nitw"
  ).length;

  const actualParticipantCount = Math.min(participants.length, teamSize);
  return Math.max(0, actualParticipantCount - nitwCount);
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
