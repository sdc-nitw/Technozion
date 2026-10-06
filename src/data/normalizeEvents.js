const PHONE_RE = /(?:\+?91[\s-]*)?([6-9](?:[\s-]?\d){9})/;
const EMPTY_VALUES = /^(none|nil|n\/?a|not applicable|na|-|tbd|coming soon\.*)$/i;
const clean = (v) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "");
const slugify = (s) =>
  clean(s).toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function parseContacts(raw, email) {
  const emailClean = typeof email === "string" ? email.trim() : "";
  if (Array.isArray(raw)) {
    if (emailClean && raw.length > 0 && !raw[0].email) {
      raw[0].email = emailClean;
    }
    return raw;
  }
  if (typeof raw !== "string" || !raw.trim()) {
    return emailClean ? [{ name: "Event POC", email: emailClean }] : [];
  }
  const segments = raw.split(/[\n|;,]+|\s+and\s+/i).map((s) => s.trim()).filter(Boolean);
  const stripName = (t) =>
    t.replace(PHONE_RE, "").replace(/\+?91\b/, "").replace(/^\s*\d+[.)]\s*/, "").replace(/[-:,()[\]]/g, " ").replace(/\s+/g, " ").trim();
  const contacts = [];
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const m = seg.match(PHONE_RE);
    if (m) {
      contacts.push({ name: stripName(seg), phone: m[1].replace(/[\s-]/g, "") });
    } else if (segments[i + 1] && PHONE_RE.test(segments[i + 1]) && !stripName(segments[i + 1])) {
      const phone = segments[i + 1].match(PHONE_RE)[1].replace(/[\s-]/g, "");
      contacts.push({ name: clean(seg.replace(/[-:,]/g, " ")), phone });
      i++;
    }
  }
  if (emailClean && contacts.length > 0) {
    contacts[0].email = emailClean;
  } else if (emailClean && contacts.length === 0) {
    contacts.push({ name: "Event POC", email: emailClean });
  }
  return contacts;
}

function parseRules(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== "string") return [];
  const text = raw.trim();
  if (!text || EMPTY_VALUES.test(text)) return [];
  return text.split("\n").map((r) => r.trim()).filter(Boolean);
}

function normalizeEvent(raw, index = 0) {
  const name = clean(raw["Event Name"] || raw.name || raw.title);
  const description = (
    raw["Event Description mention clearly and elaborately"] ||
    raw.description ||
    (raw.overview && raw.overview.description) ||
    ""
  ).toString().trim();
  const teamRaw = clean(
    raw["Team size (write 1 if individual participation)"] ||
    raw.teamSize ||
    (raw.overview && raw.overview.team_size)
  );
  const email = clean(raw["Email Address"] || raw.email);
  const rawType = clean(raw["Event Type"] || raw.eventType || raw.event_type || raw.type || raw.category);
  
  // Standardize eventType to match UI filter expectations (e.g. "Competition", "Game", "Demonstration")
  let eventType = rawType;
  if (/competition/i.test(rawType)) eventType = "Competition";
  else if (/game/i.test(rawType)) eventType = "Game";
  else if (/demonstration/i.test(rawType)) eventType = "Demonstration";

  const posterPath = raw.poster || raw.imgsrc || raw.image || "";

  return {
    id: raw._id || raw.id || "",
    _id: raw._id || raw.id || "",
    slug: slugify(name) || `event-${index + 1}`,
    name,
    club: clean(raw["Club Name"] || raw.club || raw.name),
    description,
    eventType,
    type: eventType,
    category: clean(raw.category || eventType),
    teamSize: EMPTY_VALUES.test(teamRaw) ? "" : teamRaw,
    duration: clean(
      raw["Approx time it takes for one student to complete the event"] ||
      raw.duration ||
      (raw.overview && raw.overview.duration)
    ),
    rules: parseRules(
      raw["Rules of the Event, include how many rounds, any procedure to follow, etc."] ||
      raw.rules
    ),
    contact: parseContacts(raw["POC for doubts - name and phone number"] || raw.contact, email),
    hasPrizes: Boolean(
      raw.hasPrizes ||
      raw.cashPrize ||
      eventType.toLowerCase() === "competition" ||
      /prize/i.test(description)
      
    ),
    totalCost: raw.totalCost !== undefined ? raw.totalCost : null,
    cashPrize: raw.cashPrize || raw.cash_prize || "",
    judgingCriteria: raw.judgingCriteria || (raw.overview && raw.overview.judging_criteria) || "Coming Soon...",
    imgsrc: posterPath,
    poster: posterPath,
    image: posterPath,
    glink: raw.glink || "",
    venue: raw.venue || "",
    registrationOpen: raw.registrationOpen !== false,
  };
}

function normalizeEvents(rows) {
  if (!Array.isArray(rows)) return [];
  const seen = new Set();
  const out = [];
  rows.forEach((raw, i) => {
    if (!raw || typeof raw !== "object") return;
    const ev = normalizeEvent(raw, i);
    if (!ev.name) return;
    let slug = ev.slug, n = 2;
    while (seen.has(slug)) slug = `${ev.slug}-${n++}`;
    seen.add(slug);
    out.push({ ...ev, slug });
  });
  return out;
}

module.exports = { normalizeEvents, normalizeEvent, parseContacts, parseRules, slugify };