import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { fetchEvents } from "../Events/eventsData";
import { WebCanvas } from "../bg_animation/bg_animate";
import { useAuth } from "../../Context/AuthManager";
import { isNitwEmail, isValidNitwRollNumber, normalizeRollNumber } from "../utils/registrationChecks";

const TEAM_SIZE = 4;
const GATE_FEE = 100;
const COMPETITION_FEE = 500;
const MAX_FEE = 2000;

const BROCHURE_URL = "/brochure.pdf";
const CONTACT_EMAIL = "technozion@nitw.ac.in";

const inputCls =
  "w-full px-4 py-2.5 rounded-lg bg-[#0e131b] border border-[#26354a] text-white placeholder-neutral-500 outline-none focus:outline-none focus:border-[#00f7ff] focus:ring-1 focus:ring-[#00f7ff] focus:shadow-[0_0_15px_rgba(0,247,255,0.35)] transition-all duration-200";
const labelCls =
  "block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5";

const rollNumberRules = {
  required: "NITW roll number is required",
  setValueAs: normalizeRollNumber,
  validate: (value) => isValidNitwRollNumber(value) || "Use 3–32 letters, digits or hyphens",
  shouldUnregister: true,
};

export default function Register() {
  const [allEvents, setAllEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    fetchEvents()
      .then((evs) => setAllEvents(evs))
      .catch(() => setAllEvents([]))
      .finally(() => setEventsLoading(false));
  }, []);

  const registrableEvents = useMemo(
    () => allEvents.filter((e) => e.registrationOpen !== false),
    [allEvents]
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      events: [],
      members: Array.from({ length: TEAM_SIZE - 1 }, () => ({ name: "", studentType: "external", rollNumber: "" })),
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
  const watchedEmail = watch("email") || "";
  const watchedMembers = watch("members") || [];
  const isNitw = isNitwEmail(watchedEmail);

  const idLabel = isNitw ? "College ID Card" : "Aadhaar Card";

  const { total, mode, competitionCount } = useMemo(() => {
    const comps = registrableEvents.filter(
      (e) =>
        selectedEventIds.includes(e._id || e.slug) &&
        (e.eventType || e.type || "").toLowerCase().includes("competition")
    ).length;

    if (comps > 0) {
      return {
        total: Math.min(COMPETITION_FEE * comps, MAX_FEE),
        mode: "competition",
        competitionCount: comps,
      };
    }

    if (selectedEventIds.length > 0) {
      return {
        total: Math.min(GATE_FEE * TEAM_SIZE, MAX_FEE),
        mode: "gate",
        competitionCount: 0,
      };
    }

    return { total: 0, mode: null, competitionCount: 0 };
  }, [selectedEventIds, registrableEvents]);

  const { register: authRegister, loading: authLoading } = useAuth();

  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
      gender: data.gender,
      email: data.email,
      rollNumber: isNitw ? normalizeRollNumber(data.rollNumber) : undefined,
      collegeName: data.college,
      idDocument: data.collegeId[0],
      paymentScreenshot: data.paymentScreenshot?.[0] || null,
      teamMembers: (data.members || []).map((member) => ({
        name: member.name,
        studentType: member.studentType,
        rollNumber: member.studentType === "nitw" ? normalizeRollNumber(member.rollNumber) : undefined,
      })),
      events: data.events || [],
      registrationType: data.events?.length > 0 ? (data.members?.length > 0 ? "team" : "individual") : "individual",
      password: data.password,
    };

    await authRegister(payload);
  };

  return (
    <div className="relative min-h-screen bg-black text-neutral-100 py-12 px-4 sm:px-6 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <WebCanvas />
        <div className="absolute inset-0 spotlight opacity-95"></div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8 relative z-10 pt-4">
        <div className="text-center space-y-3">
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
          <div className="p-6 sm:p-8 rounded-xl bg-[#18202c] border border-[#26354a] shadow-[0_8px_30px_rgb(0,0,0,0.45)] space-y-6">
            <h2 className="text-lg font-bold tracking-wide text-white border-b border-[#26354a] pb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Team Lead Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Full Name</label>
                <input
                  placeholder="e.g. Ash Ketchum"
                  className={inputCls}
                  {...register("name", { required: "Lead name is required" })}
                />
                {errors.name && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className={labelCls}>Gender</label>
                <select
                  className={`${inputCls} cursor-pointer`}
                  {...register("gender", { required: "Gender is required" })}
                >
                  <option value="" className="bg-[#0e131b] text-neutral-400">Select Gender</option>
                  <option value="male" className="bg-[#0e131b] text-white">Male</option>
                  <option value="female" className="bg-[#0e131b] text-white">Female</option>
                  <option value="other" className="bg-[#0e131b] text-white">Other / Prefer not to say</option>
                </select>
                {errors.gender && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.gender.message}</p>
                )}
              </div>

              <div>
                <label className={labelCls}>Email Address</label>
                <input
                  type="email"
                  placeholder="pikachu@example.com"
                  className={inputCls}
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" },
                  })}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>
                )}
              </div>

              {isNitw ? (
                <div>
                  <label htmlFor="leader-roll-number" className={labelCls}>NITW Roll Number</label>
                  <input id="leader-roll-number" type="text" autoComplete="off" placeholder="Enter your NITW roll number" className={inputCls} {...register("rollNumber", rollNumberRules)} />
                  <p className="text-xs text-neutral-400 mt-2">Your roll number will be your participant ID.</p>
                  {errors.rollNumber && <p className="text-red-400 text-xs mt-1.5">{errors.rollNumber.message}</p>}
                </div>
              ) : (
                <p className="text-xs text-cyan-300 sm:col-span-2">Your unique 26TZ… participant ID will be assigned after registration.</p>
              )}

              <div>
                <label className={labelCls}>Password</label>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  className={inputCls}
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 8, message: "Must be at least 8 characters" },
                  })}
                />
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className={labelCls}>College / University</label>
                <input
                  placeholder="e.g. NIT Warangal"
                  className={inputCls}
                  {...register("college", { required: "College name is required" })}
                />
                {errors.college && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.college.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className={labelCls}>Upload {idLabel} (PDF / JPG / PNG)</label>
              <label className="border-2 border-dashed border-[#26354a] hover:border-[#00f7ff]/70 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-[#0e131b]/60 hover:bg-[#0e131b] transition-all">
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
                <span className="text-xs text-neutral-500 mt-1">Maximum size: 5 MB</span>
              </label>
              {errors.collegeId && (
                <p className="text-red-400 text-xs mt-1.5">{errors.collegeId.message}</p>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-xl bg-[#18202c] border border-[#26354a] shadow-[0_8px_30px_rgb(0,0,0,0.45)] space-y-4">
            <div>
              <h2 className="text-lg font-bold tracking-wide text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Team Members ({TEAM_SIZE} Members Total)
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Enter each teammate's name and institution type. NITW students use their roll number as their ID; others receive a unique 26TZ… ID.
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
                    aria-label={`Member ${i + 2} name`}
                    {...register(`members.${i}.name`, { required: "Member name is required" })}
                  />
                  {errors.members?.[i]?.name && (
                    <p className="text-red-400 text-xs mt-1.5">{errors.members[i].name.message}</p>
                  )}
                  <label htmlFor={`member-${i}-institution`} className={`${labelCls} mt-4`}>Institution</label>
                  <select id={`member-${i}-institution`} className={inputCls} {...register(`members.${i}.studentType`)}>
                    <option value="external">Other institution</option>
                    <option value="nitw">NITW student</option>
                  </select>
                  {watchedMembers[i]?.studentType === "nitw" ? (
                    <div className="mt-4">
                      <label htmlFor={`member-${i}-roll`} className={labelCls}>NITW Roll Number</label>
                      <input id={`member-${i}-roll`} type="text" placeholder="Roll number" className={inputCls} {...register(`members.${i}.rollNumber`, rollNumberRules)} />
                      {errors.members?.[i]?.rollNumber && <p className="text-red-400 text-xs mt-1.5">{errors.members[i].rollNumber.message}</p>}
                    </div>
                  ) : <p className="text-xs text-cyan-300 mt-3">A 26TZ… ID will be assigned after registration.</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold tracking-wide text-neutral-100 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                Select Participating Events
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Click any event to add or remove it from your registration.
              </p>
            </div>

            {eventsLoading ? (
              <div className="text-center py-6 text-neutral-500 font-mono text-sm animate-pulse">
                Loading events…
              </div>
            ) : registrableEvents.length === 0 ? (
              <div className="text-center py-6 text-neutral-500 font-mono text-sm">
                No events available yet.
              </div>
            ) : (
              <div className="flex flex-wrap gap-3 pt-1">
                {registrableEvents.map((ev) => {
                  const eventVal = ev._id || ev.slug;
                  const isChecked = selectedEventIds.includes(eventVal);

                  return (
                    <label
                      key={ev.slug}
                      className={`inline-flex items-center justify-center px-6 py-2.5 rounded-full cursor-pointer select-none font-bold text-xs tracking-wider uppercase transition-all duration-200 border-2 ${
                        isChecked
                          ? "!bg-[#00f7ff] !border-[#00f7ff] shadow-[0_0_20px_#00f7ff] scale-105"
                          : "bg-transparent border-[#00f7ff] hover:bg-[#00f7ff]/10 hover:shadow-[0_0_12px_rgba(0,247,255,0.4)]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={eventVal}
                        className="hidden"
                        {...register("events")}
                      />
                      <span
                        className={`transition-colors duration-150 ${
                          isChecked ? "!text-black font-extrabold" : "!text-white"
                        }`}
                      >
                        {ev.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {!isNitw && (
            <section aria-labelledby="payment-heading" className="rounded-2xl border border-cyan-400/25 bg-[#18202c] shadow-[0_8px_30px_rgb(0,0,0,0.45)] p-6 sm:p-8 space-y-6">
              <div className="space-y-2">
                <h2 id="payment-heading" className="text-xl font-bold text-white">Payment &amp; Proof</h2>
                <p className="text-sm text-neutral-300">Transfer your registration fee to the account below, then attach the payment screenshot.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
                <div className="space-y-4 rounded-xl border border-cyan-400/20 bg-[#0e131b] p-5">
                  <p className="text-xs uppercase tracking-widest font-bold text-cyan-300">Amount to transfer</p>
                  <div className="space-y-1">
                    <p className="text-sm text-neutral-400">
                      {mode === "competition"
                        ? `${competitionCount} Competition${competitionCount > 1 ? "s" : ""} × ₹${COMPETITION_FEE}`
                        : mode === "gate"
                        ? `Gate Entry · ${TEAM_SIZE} Members × ₹${GATE_FEE}`
                        : "No events selected yet"}
                    </p>
                    <div className="text-4xl font-black tracking-tight text-white flex items-baseline gap-2">
                      <span>₹{total}</span>
                      <span className="text-xs font-normal text-neutral-400 uppercase font-mono">INR</span>
                    </div>
                    <p className="text-xs text-neutral-400 pt-1">
                      {total > 0 ? "Use this amount for your bank transfer." : "Select your events above to calculate the fee before paying."}
                    </p>
                    <p className="text-xs text-neutral-400">Accommodation as per standard rates</p>
                  </div>

                  {mode === "gate" && (
                    <div className="text-xs text-neutral-300 bg-[#0e131b] border border-[#26354a] rounded-lg p-3 space-y-1 text-left">
                      <p>🎟️ <strong className="text-white">Gate Entry</strong> — covers access to all Demonstrations &amp; Games.</p>
                      <p>Fee: ₹{GATE_FEE} × {TEAM_SIZE} members = ₹{GATE_FEE * TEAM_SIZE}</p>
                    </div>
                  )}
                  {mode === "competition" && (
                    <div className="text-xs text-neutral-300 bg-[#0e131b] border border-[#26354a] rounded-lg p-3 space-y-1 text-left">
                      <p>🏆 <strong className="text-white">Competition</strong> — charged per event per team.</p>
                      <p>Fee: ₹{COMPETITION_FEE} × {competitionCount} event{competitionCount > 1 ? "s" : ""} = ₹{Math.min(COMPETITION_FEE * competitionCount, MAX_FEE)}</p>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-[#26354a] bg-[#0e131b] p-5 space-y-4">
                  <h3 className="text-sm font-bold text-cyan-300">1. Transfer to this account</h3>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-neutral-400">Name</dt>
                      <dd className="font-semibold text-white">TECHNOZION</dd>
                    </div>
                    <div>
                      <dt className="text-neutral-400">Bank A/c No</dt>
                      <dd className="font-mono text-white break-all">62046706567</dd>
                    </div>
                    <div>
                      <dt className="text-neutral-400">IFSC</dt>
                      <dd className="font-mono text-white">SBIN0020149</dd>
                    </div>
                    <div>
                      <dt className="text-neutral-400">Bank/Branch</dt>
                      <dd className="text-white">SBI NITW</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="border-t border-[#26354a] pt-6 space-y-3">
                <label htmlFor="payment-screenshot" className="block text-sm font-bold text-cyan-300">2. Upload payment screenshot</label>
                <p id="payment-screenshot-help" className="text-xs text-neutral-300">After the transfer succeeds, upload a clear screenshot showing the amount and transaction reference.</p>
                <label htmlFor="payment-screenshot" className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-[#0e131b] transition-colors focus-within:ring-2 focus-within:ring-cyan-300 ${paymentFile?.[0] ? "border-cyan-400" : "border-[#395563] hover:border-cyan-400"}`}>
                  <input
                    id="payment-screenshot"
                    type="file"
                    accept="image/jpeg,image/png"
                    aria-describedby="payment-screenshot-help payment-screenshot-error"
                    aria-invalid={Boolean(errors.paymentScreenshot)}
                    className="sr-only"
                    {...register("paymentScreenshot", {
                      required: total > 0 ? "Payment screenshot is required" : false,
                      validate: {
                        size: (files) => !files?.[0] || files[0].size <= 5 * 1024 * 1024 || "Screenshot must be 5 MB or smaller",
                        type: (files) => !files?.[0] || ["image/jpeg", "image/png"].includes(files[0].type) || "Upload a JPG or PNG screenshot",
                      },
                    })}
                  />
                  <svg className="w-8 h-8 text-neutral-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm font-medium text-neutral-300">
                    {paymentFile?.[0]?.name ? (
                      <span className="text-cyan-300 font-mono break-all">{paymentFile[0].name}</span>
                    ) : (
                      "Choose payment screenshot"
                    )}
                  </span>
                  <span className="text-xs text-neutral-400 mt-2">{paymentFile?.[0] ? "Click to replace · JPG / PNG · Up to 5 MB" : "JPG / PNG · Up to 5 MB"}</span>
                </label>
                {errors.paymentScreenshot && (
                  <p id="payment-screenshot-error" role="alert" className="text-red-400 text-xs mt-1.5">{errors.paymentScreenshot.message}</p>
                )}
              </div>
            </section>
          )}

          <button
            type="submit"
            disabled={isSubmitting || authLoading || selectedEventIds.length === 0}
            className="w-full py-4 rounded-xl border border-cyan-300 font-bold uppercase tracking-wider text-sm transition-all duration-300 disabled:cursor-not-allowed disabled:bg-[#243b46] disabled:text-[#a7c4cd] disabled:border-[#395563] disabled:shadow-none bg-cyan-500 enabled:hover:bg-cyan-400 text-black shadow-[0_0_25px_rgba(6,182,212,0.4)] enabled:hover:shadow-[0_0_35px_rgba(6,182,212,0.6)]"
          >
            {authLoading
              ? "Uploading & Submitting…"
              : selectedEventIds.length === 0
              ? "Select at least one event to proceed"
              : "Submit Registration"}
          </button>
        </form>

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