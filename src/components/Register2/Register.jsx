import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { fetchEvents } from "../Events/eventsData";

// ─── Fee constants ────────────────────────────────────────────────────────────
const TEAM_SIZE = 4; // fixed team size (confirm: 4 or 5)
const GATE_FEE = 200; // per-person gate entry fee
const COMPETITION_FEE = 500; // per-team per-competition event fee
const MAX_FEE = 2000; // cap if needed

// ── Gender-based fees (commented until confirmed) ──────────────────────────
// const GATE_FEE_BY_GENDER      = { male: 200, female: 150, other: 200 };
// const COMPETITION_FEE_BY_GENDER = { male: 500, female: 400, other: 500 };

// ─── Static config (replace placeholders once assets are ready) ───────────────
const BROCHURE_URL = "/brochure.pdf"; // TODO: replace with actual brochure link
const QR_SRC = "/payment-qr.png"; // TODO: replace with actual QR image
const CONTACT_EMAIL = "technozion@nitw.ac.in";

// ─── Fallback poster SVG ──────────────────────────────────────────────────────
const FALLBACK_POSTER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='#121215'/><text x='50%' y='50%' fill='#404040' font-family='sans-serif' font-size='16' text-anchor='middle'>Poster coming soon</text></svg>"
  );

// ─── Input / label styles ──────────────────────────────────────────────────────
const inputCls =
  "w-full px-4 py-2.5 rounded-xl bg-neutral-950/80 border border-neutral-700 text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition";
const labelCls =
  "block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5";

export default function Register() {
  // ── Events state (loaded from API / local JSON fallback) ─────────────────
  const [allEvents, setAllEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    fetchEvents()
      .then((evs) => setAllEvents(evs))
      .catch(() => setAllEvents([]))
      .finally(() => setEventsLoading(false));
  }, []);

  // Only show events that are open for registration
  const registrableEvents = useMemo(
    () => allEvents.filter((e) => e.registrationOpen !== false),
    [allEvents]
  );

  // ── Form ─────────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      events: [],
      members: Array(TEAM_SIZE - 1).fill(""),
    },
  });

  const rawSelectedEvents = watch("events");
  const selectedEventIds = useMemo(
    () => rawSelectedEvents || [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(rawSelectedEvents)]
  );
  const collegeIdFile = watch("collegeId");
  const paymentFile = watch("paymentScreenshot");
  // const gender = watch("gender"); // ← uncomment when gender-based fees go live

  // ── Fee calculation ───────────────────────────────────────────────────────
  const { total, mode, competitionCount } = useMemo(() => {
    const comps = registrableEvents.filter(
      (e) =>
        selectedEventIds.includes(e.slug) &&
        e.type?.toLowerCase() === "competition"
    ).length;

    if (comps > 0) {
      // const rate = COMPETITION_FEE_BY_GENDER[gender] ?? COMPETITION_FEE;
      const rate = COMPETITION_FEE;
      return {
        total: Math.min(rate * comps, MAX_FEE),
        mode: "competition",
        competitionCount: comps,
      };
    }

    if (selectedEventIds.length > 0) {
      // const rate = GATE_FEE_BY_GENDER[gender] ?? GATE_FEE;
      const rate = GATE_FEE;
      return {
        total: Math.min(rate * TEAM_SIZE, MAX_FEE),
        mode: "gate",
        competitionCount: 0,
      };
    }

    return { total: 0, mode: null, competitionCount: 0 };
  }, [selectedEventIds, registrableEvents /*, gender*/]);

  // ── Submit ────────────────────────────────────────────────────────────────
  // TODO (backend): update /api/register to accept:
  //   name, gender, email, college, collegeId (file upload URL),
  //   members (JSON array of names), events (JSON array of slugs),
  //   amount, paymentScreenshot (file upload URL)
  // No password field — auth is no longer required for registration.
  const onSubmit = async (data) => {
    const fd = new FormData();
    fd.append("name", data.name);
    fd.append("gender", data.gender);
    fd.append("email", data.email);
    fd.append("college", data.college);
    fd.append("collegeId", data.collegeId[0]);
    fd.append("paymentScreenshot", data.paymentScreenshot[0]);
    fd.append("members", JSON.stringify(data.members || []));
    fd.append("events", JSON.stringify(data.events));
    fd.append("amount", total.toString());

    // TODO (backend): POST to actual registration endpoint
    const res = await fetch("/api/register", { method: "POST", body: fd });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.message || "Registration failed. Please try again.");
    }
  };

  // ─── UI ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-neutral-100 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="text-center space-y-3">
          <div className="inline-block px-3 py-1 rounded-full border border-cyan-500/40 bg-cyan-950/20 text-cyan-400 text-xs font-mono tracking-wider uppercase">
            Official Registration Portal
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            Registration
          </h1>
          <p className="text-neutral-400 text-sm max-w-md mx-auto">
            Join the biggest technical fest of NIT Warangal.{" "}
            <a
              href={BROCHURE_URL}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 underline underline-offset-4 hover:text-cyan-300 transition-colors"
            >
              📄 Review the rulebook &amp; fee guidelines
            </a>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          {/* ── Section 1: Team Lead Details ── */}
          <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800 shadow-xl backdrop-blur-md space-y-6">
            <h2 className="text-lg font-semibold tracking-wide text-neutral-200 border-b border-neutral-800 pb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Team Lead Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className={labelCls}>Full Name</label>
                <input
                  placeholder="e.g. Alex Vance"
                  className={inputCls}
                  {...register("name", { required: "Lead name is required" })}
                />
                {errors.name && <p className="text-red-400 text-xs mt-1.5">{errors.name.message}</p>}
              </div>

              {/* Gender
                  NOTE: Gender affects fee calculation (commented logic above).
                  The field is collected now so the backend can store it.
                  Enable gender-based fees by swapping the commented `rate` lines in the
                  useMemo above once the fee structure is confirmed. */}
              <div>
                <label className={labelCls}>Gender</label>
                <select
                  className={inputCls}
                  {...register("gender", { required: "Gender is required" })}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Prefer not to say</option>
                </select>
                {errors.gender && <p className="text-red-400 text-xs mt-1.5">{errors.gender.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className={labelCls}>Email Address</label>
                <input
                  type="email"
                  placeholder="alex@example.com"
                  className={inputCls}
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" },
                  })}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>}
              </div>

              {/* College */}
              <div>
                <label className={labelCls}>College / University</label>
                <input
                  placeholder="e.g. NIT Warangal"
                  className={inputCls}
                  {...register("college", { required: "College name is required" })}
                />
                {errors.college && <p className="text-red-400 text-xs mt-1.5">{errors.college.message}</p>}
              </div>
            </div>

            {/* College ID Upload */}
            <div>
              <label className={labelCls}>Upload College ID Proof (PDF / JPG / PNG)</label>
              <label className="border-2 border-dashed border-neutral-700 hover:border-cyan-500/60 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-neutral-950/40 hover:bg-neutral-950/70 transition-all">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  {...register("collegeId", { required: "College ID proof is required" })}
                />
                <svg className="w-8 h-8 text-neutral-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm font-medium text-neutral-300">
                  {collegeIdFile?.[0]?.name
                    ? <span className="text-cyan-400 font-mono">{collegeIdFile[0].name}</span>
                    : "Click to select a file or drag it here"}
                </span>
                <span className="text-xs text-neutral-500 mt-1">Maximum size: 5 MB</span>
              </label>
              {errors.collegeId && <p className="text-red-400 text-xs mt-1.5">{errors.collegeId.message}</p>}
            </div>
          </div>

          {/* ── Section 2: Team Members ── */}
          <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800 shadow-xl backdrop-blur-md space-y-4">
            <div>
              <h2 className="text-lg font-semibold tracking-wide text-neutral-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Team Members ({TEAM_SIZE} Members Total)
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Enter your remaining teammates' names below. Only names are required for other members.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {Array.from({ length: TEAM_SIZE - 1 }).map((_, i) => (
                <div key={i}>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">
                    Member #{i + 2}
                  </label>
                  <input
                    placeholder="Name"
                    className={inputCls}
                    {...register(`members.${i}`, { required: "Member name is required" })}
                  />
                  {errors.members?.[i] && (
                    <p className="text-red-400 text-xs mt-1.5">{errors.members[i].message}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Section 3: Select Events ── */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold tracking-wide text-neutral-100 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                Select Participating Events
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Click any card to add it to your ticket.{" "}
                <span className="text-cyan-500">Competitions</span> are charged ₹{COMPETITION_FEE}/event per team.{" "}
                <span className="text-neutral-300">Games &amp; Demonstrations</span> are covered by the gate entry fee (₹{GATE_FEE} × {TEAM_SIZE} members).
              </p>
            </div>

            {eventsLoading ? (
              <div className="text-center py-12 text-neutral-500 font-mono text-sm animate-pulse">
                Loading events…
              </div>
            ) : registrableEvents.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 font-mono text-sm">
                No events available yet. Check back soon!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {registrableEvents.map((ev) => {
                  const isChecked = selectedEventIds.includes(ev.slug);
                  const isComp = ev.type?.toLowerCase() === "competition";
                  return (
                    <label
                      key={ev.slug}
                      className={`group relative flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer ${
                        isChecked
                          ? "border-cyan-400 bg-cyan-950/20 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                          : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-900/80"
                      }`}
                    >
                      <div className="relative w-full h-44 overflow-hidden bg-neutral-950">
                        <img
                          src={ev.poster || ev.imgsrc || FALLBACK_POSTER}
                          alt={ev.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = FALLBACK_POSTER;
                          }}
                        />
                        <span
                          className={`absolute top-3 right-3 text-[11px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-full backdrop-blur-md border ${
                            isComp
                              ? "bg-amber-950/80 border-amber-600 text-amber-300"
                              : "bg-black/70 border-neutral-700 text-neutral-300"
                          }`}
                        >
                          {ev.type}
                        </span>
                      </div>

                      <div className="p-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-neutral-100 group-hover:text-cyan-300 transition-colors">
                            {ev.name}
                          </p>
                          <p className="text-xs text-neutral-500 font-mono mt-0.5">
                            {isComp ? `₹${COMPETITION_FEE}/team/event` : "Included in gate entry"}
                          </p>
                        </div>

                        <div
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center flex-shrink-0 transition-colors ${
                            isChecked
                              ? "bg-cyan-500 border-cyan-400 text-black"
                              : "border-neutral-700 bg-neutral-950"
                          }`}
                        >
                          {isChecked && (
                            <svg className="w-4 h-4 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <input type="checkbox" value={ev.slug} className="hidden" {...register("events")} />
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Section 4: Payment ── */}
          <div className="rounded-2xl border border-cyan-500/30 bg-neutral-950/80 backdrop-blur-xl p-6 sm:p-8 shadow-[0_0_30px_rgba(6,182,212,0.1)] space-y-6">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              Payment
            </span>

            <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
              {/* Summary */}
              <div className="space-y-4 max-w-sm text-center md:text-left">
                <div className="space-y-1">
                  <p className="text-sm text-neutral-400">
                    {mode === "competition"
                      ? `${competitionCount} Competition${competitionCount > 1 ? "s" : ""} × ₹${COMPETITION_FEE}`
                      : mode === "gate"
                      ? `Gate Entry · ${TEAM_SIZE} Members × ₹${GATE_FEE}`
                      : "No events selected yet"}
                  </p>
                  <div className="text-4xl font-black tracking-tight text-white flex items-baseline gap-1 justify-center md:justify-start">
                    <span>₹{total}</span>
                    <span className="text-xs font-normal text-neutral-400 uppercase font-mono">INR</span>
                  </div>
                  {total > 0 && (
                    <p className="text-xs text-neutral-500 pt-1">
                      Scan the QR via GPay / PhonePe / Paytm, then upload the screenshot below.
                    </p>
                  )}
                </div>

                {/* Info boxes */}
                {mode === "gate" && (
                  <div className="text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 rounded-xl p-3 space-y-1 text-left">
                    <p>🎟️ <strong className="text-neutral-200">Gate Entry</strong> — covers access to all Demonstrations &amp; Games.</p>
                    <p>Fee: ₹{GATE_FEE} × {TEAM_SIZE} members = ₹{GATE_FEE * TEAM_SIZE}</p>
                  </div>
                )}
                {mode === "competition" && (
                  <div className="text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 rounded-xl p-3 space-y-1 text-left">
                    <p>🏆 <strong className="text-neutral-200">Competition</strong> — charged per event per team.</p>
                    <p>Fee: ₹{COMPETITION_FEE} × {competitionCount} event{competitionCount > 1 ? "s" : ""} = ₹{Math.min(COMPETITION_FEE * competitionCount, MAX_FEE)}</p>
                  </div>
                )}
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-3 flex-shrink-0">
                <div className="p-3 bg-white rounded-2xl shadow-xl border border-neutral-300">
                  {/* TODO: replace /payment-qr.png with the real QR image */}
                  <img src={QR_SRC} alt="Payment QR" className="w-40 h-40 object-contain" />
                </div>
                <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
                  Scan with any UPI app
                </span>
              </div>
            </div>

            {/* Payment Screenshot Upload */}
            {total > 0 && (
              <div>
                <label className={labelCls}>Upload Payment Screenshot</label>
                <label className="border-2 border-dashed border-neutral-700 hover:border-cyan-500/60 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-neutral-950/40 hover:bg-neutral-950/70 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    {...register("paymentScreenshot", {
                      required: total > 0 ? "Payment screenshot is required" : false,
                    })}
                  />
                  <svg className="w-8 h-8 text-neutral-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm font-medium text-neutral-300">
                    {paymentFile?.[0]?.name
                      ? <span className="text-cyan-400 font-mono">{paymentFile[0].name}</span>
                      : "Click to upload your payment screenshot"}
                  </span>
                  <span className="text-xs text-neutral-500 mt-1">JPG / PNG — Maximum size: 5 MB</span>
                </label>
                {errors.paymentScreenshot && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.paymentScreenshot.message}</p>
                )}
              </div>
            )}
          </div>

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={isSubmitting || total === 0}
            className="w-full py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)]"
          >
            {isSubmitting
              ? "Submitting…"
              : total === 0
              ? "Select at least one event to proceed"
              : `Confirm & Pay ₹${total}`}
          </button>
        </form>

        {/* ── Contact footer ── */}
        <p className="text-center text-xs text-neutral-500 font-mono pb-4">
          For unintended registrations, payment issues or discrepancies, reach out to{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-neutral-400 underline hover:text-cyan-400">
            {CONTACT_EMAIL}
          </a>
        </p>
      </div>
    </div>
  );
}