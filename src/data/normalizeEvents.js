const PHONE_RE = /(?:\+?91[\s-]*)?([6-9](?:[\s-]?\d){9})/;
const EMPTY_VALUES = /^(none|nil|n\/?a|not applicable|na|-|tbd|coming soon\.*)$/i;
const clean = (v) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "");
const slugify = (s) =>
  clean(s).toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function parseContacts(raw) {
  if (typeof raw !== "string" || !raw.trim()) return [];
  const segments = raw.split(/[\n|;,]+|\s+and\s+/i).map((s) => s.trim()).filter(Boolean);
  const contacts = [];
  const stripName = (t) =>
    t.replace(PHONE_RE, "").replace(/\+?91\b/, "").replace(/^\s*\d+[.)]\s*/, "").replace(/[-:,()[\]]/g, " ").replace(/\s+/g, " ").trim();
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
  return contacts;
}

function parseRules(raw) {
  if (typeof raw !== "string") return [];
  const text = raw.trim();
  if (!text || EMPTY_VALUES.test(text)) return [];
  return text.split("\n").map((r) => r.trim()).filter(Boolean);
}

function parsePrize(description) {
  const m = String(description || "").match(/(\d[\d,]*)\s*(k)?\s*prize\s*pool/i);
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, ""));
  if (!Number.isFinite(n) || n <= 0) return null;
  return m[2] ? n * 1000 : n;
}

function normalizeEvent(raw, index = 0) {
  const name = clean(raw["Event Name"]);
  const description = (raw["Event Description mention clearly and elaborately"] || "").toString().trim();
  const teamRaw = clean(raw["Team size (write 1 if individual participation)"]);
  return {
    slug: slugify(name) || `event-${index + 1}`,
    name,
    club: clean(raw["Club Name"]),
    description,
    eventType: clean(raw["Event Type"]),
    teamSize: EMPTY_VALUES.test(teamRaw) ? "" : teamRaw,
    duration: clean(raw["Approx time it takes for one student to complete the event"]),
    rules: parseRules(raw["Rules of the Event, include how many rounds, any procedure to follow, etc."]),
    contact: parseContacts(raw["POC for doubts - name and phone number"]),
    totalCost: parsePrize(description),
    judgingCriteria: "Coming Soon...",
    imgsrc: "",
    glink: "",
    venue: "",
    registrationOpen: true,
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