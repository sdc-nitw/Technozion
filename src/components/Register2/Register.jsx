import { useForm } from "react-hook-form";
import { useMemo } from "react";

const TEAM_SIZE = 4;
const GATE_FEE = 200;
const COMPETITION_FEE = 500;
const MAX_FEE = 2000;
const BROCHURE_URL = "/brochure.pdf";
const QR_SRC = "/payment-qr.png";
const CONTACT_EMAIL = "technozion@nitw.ac.in";

// const GATE_FEE_BY_GENDER = { male: 200, female: 150, other: 200 };
// const COMPETITION_FEE_BY_GENDER = { male: 500, female: 400, other: 500 };

const FALLBACK_POSTER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='#121215'/><text x='50%' y='50%' fill='#404040' font-family='sans-serif' font-size='16' text-anchor='middle'>Poster coming soon</text></svg>"
  );

const EVENTS = [
  { id: "demo1", name: "RoboWars", type: "demonstration", poster: "/posters/demo1.jpg" },
  { id: "game1", name: "Laser Tag", type: "game", poster: "/posters/game1.jpg" },
  { id: "comp1", name: "Hackathon", type: "competition", poster: "/posters/comp1.jpg" },
  { id: "comp2", name: "Circuit Craze", type: "competition", poster: "/posters/comp2.jpg" },
];

export default function Register() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { events: [], members: ["", "", ""] },
  });

  const selected = watch("events") || [];
  const collegeIdFile = watch("collegeId");
  const gender = watch("gender");

  const { total, mode, competitionCount } = useMemo(() => {
    const comps = EVENTS.filter(
      (e) => selected.includes(e.id) && e.type === "competition"
    ).length;

    if (comps > 0) {
      // const rate = COMPETITION_FEE_BY_GENDER[gender] ?? COMPETITION_FEE;
      return {
        total: Math.min(COMPETITION_FEE * comps, MAX_FEE),
        mode: "competition",
        competitionCount: comps,
      };
    }
    if (selected.length > 0) {
      // const rate = GATE_FEE_BY_GENDER[gender] ?? GATE_FEE;
      return {
        total: Math.min(GATE_FEE * TEAM_SIZE, MAX_FEE),
        mode: "gate",
        competitionCount: 0,
      };
    }
    return { total: 0, mode: null, competitionCount: 0 };
  }, [selected, gender]);

  const onSubmit = async (data) => {
    const fd = new FormData();
    fd.append("name", data.name);
    fd.append("gender", data.gender);
    fd.append("email", data.email);
    fd.append("college", data.college);
    fd.append("collegeId", data.collegeId[0]);
    fd.append("members", JSON.stringify(data.members || []));
    fd.append("events", JSON.stringify(data.events));
    fd.append("amount", total.toString());
    await fetch("/api/register", { method: "POST", body: fd });
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
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
              Review the rulebook & fee guidelines
            </a>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800 shadow-xl backdrop-blur-md space-y-6">
            <h2 className="text-lg font-semibold tracking-wide text-neutral-200 border-b border-neutral-800 pb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Team Lead Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                  Full Name
                </label>
                <input
                  placeholder="e.g. Alex Vance"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-950/80 border border-neutral-700 text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  {...register("name", { required: "Lead name is required" })}
                />
                {errors.name && <p className="text-red-400 text-xs mt-1.5">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                  Gender
                </label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-950/80 border border-neutral-700 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  {...register("gender", { required: "Gender is required" })}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <p className="text-red-400 text-xs mt-1.5">{errors.gender.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="alex@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-950/80 border border-neutral-700 text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" },
                  })}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                  College / University
                </label>
                <input
                  placeholder="e.g. NIT Warangal"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-950/80 border border-neutral-700 text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  {...register("college", { required: "College is required" })}
                />
                {errors.college && <p className="text-red-400 text-xs mt-1.5">{errors.college.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                Upload College ID Proof (PDF/JPG/PNG)
              </label>
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
                  {collegeIdFile?.[0]?.name ? (
                    <span className="text-cyan-400 font-mono">{collegeIdFile[0].name}</span>
                  ) : (
                    "Click to select a file or drag it here"
                  )}
                </span>
                <span className="text-xs text-neutral-500 mt-1">Maximum size: 5MB</span>
              </label>
              {errors.collegeId && <p className="text-red-400 text-xs mt-1.5">{errors.collegeId.message}</p>}
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800 shadow-xl backdrop-blur-md space-y-4">
            <div>
              <h2 className="text-lg font-semibold tracking-wide text-neutral-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                Team Members ({TEAM_SIZE} Members Total)
              </h2>
              <p className="text-xs text-neutral-400 mt-1">Enter remaining teammate names below.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {Array.from({ length: TEAM_SIZE - 1 }).map((_, i) => (
                <div key={i}>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">
                    Member #{i + 2}
                  </label>
                  <input
                    placeholder="Name"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950/80 border border-neutral-700 text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                    {...register(`members.${i}`, { required: "Name is required" })}
                  />
                  {errors.members?.[i] && (
                    <p className="text-red-400 text-xs mt-1.5">{errors.members[i].message}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold tracking-wide text-neutral-100 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                Select Participating Events
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">Click any card to add it to your ticket.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {EVENTS.map((ev) => {
                const isChecked = selected.includes(ev.id);
                return (
                  <label
                    key={ev.id}
                    className={`group relative flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer ${
                      isChecked
                        ? "border-cyan-400 bg-cyan-950/20 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                        : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-900/80"
                    }`}
                  >
                    <div className="relative w-full h-44 overflow-hidden bg-neutral-950">
                      <img
                        src={ev.poster}
                        alt={ev.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_POSTER;
                        }}
                      />
                      <span className="absolute top-3 right-3 text-[11px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-neutral-700 text-neutral-300">
                        {ev.type}
                      </span>
                    </div>

                    <div className="p-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-neutral-100 group-hover:text-cyan-300 transition-colors">
                          {ev.name}
                        </p>
                        <p className="text-xs text-neutral-500 font-mono mt-0.5">
                          {ev.type === "competition" ? `₹${COMPETITION_FEE}/event` : "Included in Entry"}
                        </p>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
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
                      <input type="checkbox" value={ev.id} className="hidden" {...register("events")} />
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-500/30 bg-neutral-950/80 backdrop-blur-xl p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-center justify-between shadow-[0_0_30px_rgba(6,182,212,0.1)]">
            <div className="space-y-4 max-w-sm text-center md:text-left">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
                Payment Summary
              </span>
              <div className="space-y-1">
                <p className="text-sm text-neutral-400">
                  {mode === "competition"
                    ? `${competitionCount} Competition(s) × ₹${COMPETITION_FEE}`
                    : mode === "gate"
                    ? `Gate Entry (${TEAM_SIZE} Teammates) × ₹${GATE_FEE}`
                    : "No events selected yet"}
                </p>
                <div className="text-4xl font-black tracking-tight text-white flex items-baseline gap-1 justify-center md:justify-start">
                  <span>₹{total}</span>
                  <span className="text-xs font-normal text-neutral-400 uppercase font-mono">INR</span>
                </div>
              </div>
              <p className="text-xs text-neutral-500">
                Scan the UPI code via any supported app (GPay / PhonePe / Paytm) and submit below.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-white rounded-2xl shadow-xl border border-neutral-300">
                <img src={QR_SRC} alt="Payment QR" className="w-36 h-36 object-contain" />
              </div>
              <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
                Scan with any UPI app
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || total === 0}
            className="w-full py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)]"
          >
            {isSubmitting ? "Submitting..." : total === 0 ? "Select an event to proceed" : `Confirm & Pay ₹${total}`}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-500 font-mono">
          For technical discrepancies or payment issues, reach out to{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-neutral-400 underline hover:text-cyan-400">
            {CONTACT_EMAIL}
          </a>
        </p>
      </div>
    </div>
  );
}