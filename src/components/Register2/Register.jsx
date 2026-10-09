import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import useEvents from "../Events/useEvents";
import EventsLoading from "../Events/EventsLoading";
import "./registration-modal.css";
import { useAuth } from "../../Context/AuthManager";
import { isNitwEmail, isValidNitwRollNumber, normalizeRollNumber } from "../utils/registrationChecks";
import {
  computeRegistrationFee,
  groupRegistrationEvents,
  normalizeStudentType,
} from "./feeUtils";

// ─── Static config ────────────────────────────────────────────────────────────
const TEAM_SIZE = 4; // fixed team size
const CONTACT_EMAIL = "technozion@nitw.ac.in";

// ─── Input / label styles (Matched to Patron theme) ───────────────────────────
const inputCls =
  "ui-input w-full px-4 py-2.5 rounded-lg bg-ui-input border border-ui-border text-white placeholder-neutral-500 outline-none focus:outline-none focus:border-ui-accent transition-all duration-200";
const labelCls =
  "block text-sm font-medium text-ui-muted mb-1.5";

const rollNumberRules = {
  required: "NITW roll number is required",
  setValueAs: normalizeRollNumber,
  validate: (value) => isValidNitwRollNumber(value) || "Use 3–32 letters, digits or hyphens",
  shouldUnregister: true,
};

export default function Register() {
  // ── Events state ──────────────────────────────────────────────────────────
  const { events: allEvents, isLoading: eventsLoading } = useEvents();

  // Only show events that are open for registration
  const registrableEvents = useMemo(
    () => allEvents.filter((e) => e.registrationOpen !== false),
    [allEvents]
  );

  // ── Form ──────────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    shouldFocusError: false,
    defaultValues: {
      accommodation: false,
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
  const groupedRegistrableEvents = useMemo(
    () => groupRegistrationEvents(registrableEvents),
    [registrableEvents]
  );
  const collegeIdFile = watch("collegeId");
  const paymentFile = watch("paymentScreenshot");
  const needAccommodation = watch("needAccommodation") || false;
  const watchedEmail = watch("email") || "";
  const watchedMembersRaw = watch("members");
  const watchedMembers = watchedMembersRaw || [];
  const isNitw = isNitwEmail(watchedEmail);

  const idLabel = isNitw ? "College ID Card" : "Aadhaar Card";

  // ── Fee calculation ────────────────────────────────────────────────────────
  const { total, mode, competitionCount, externalCount, requiresPayment } = computeRegistrationFee({
    isNitwLead: isNitw,
    members: watchedMembers,
    selectedEventIds,
    events: registrableEvents,
  });

  // ── Modal state ──────────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(true);
  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState("");
  const dialog = useRef(null);
  const body = useRef(null);
  const heading = useRef(null);
  const steps = [
    { id: 0, label: "Team lead" },
    { id: 1, label: "Your team" },
    { id: 2, label: "Your events" },
    { id: 3, label: "Identity proof" },
    { id: 4, label: "Payment" },
    { id: 5, label: "Review & submit" },
  ];
  const currentIndex = steps.findIndex(item => item.id === step);
  const current = steps[currentIndex] || steps[0];
  const reviewName = watch("name");
  const reviewCollege = watch("college");

  // ── Submit ─────────────────────────────────────────────────────────────────
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
      accommodation: !!data.needAccommodation,
      needAccommodation: !!data.needAccommodation,
      teamMembers: (data.members || []).map((member) => ({
        name: member.name,
        studentType: normalizeStudentType(member.studentType),
        rollNumber: normalizeStudentType(member.studentType) === "nitw" ? normalizeRollNumber(member.rollNumber) : undefined,
      })),
      events: data.events || [],
      registrationType: data.events?.length > 0 ? (data.members?.length > 0 ? "team" : "individual") : "individual",
      password: data.password,
    };

    const result = await authRegister(payload);
    if (result?.ok === false) setStepError(result.message);
  };

  const busy = isSubmitting || authLoading;
  useEffect(() => {
    const element = dialog.current;
    if (modalOpen && !element.open) element.showModal();
    if (!modalOpen && element.open) element.close();
    if (!modalOpen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = overflow; };
  }, [modalOpen]);

  useEffect(() => {
    if (!modalOpen) return;
    if (body.current) body.current.scrollTop = 0;
    heading.current?.focus({ preventScroll: true });
  }, [step, modalOpen]);

  const goTo = target => { setStepError(""); setStep(target); };
  const nextStep = async () => {
    if (busy) return;
    const fields = step === 0
      ? ["name", "gender", "email", "password", "college", ...(isNitw ? ["rollNumber"] : [])]
      : step === 1 ? watchedMembers.flatMap((member, index) => {
          const memberType = watch(`members.${index}.studentType`) || member?.studentType || "external";
          return [`members.${index}.name`, ...(memberType === "nitw" ? [`members.${index}.rollNumber`] : [])];
        })
      : step === 2 ? ["events"] : step === 3 ? ["collegeId"] : ["paymentScreenshot"];
    if (!await trigger(fields, { shouldFocus: true })) { setStepError("Check the required details before continuing."); return; }

    const nextTarget = step === 3 && requiresPayment ? 4 : step === 3 && !requiresPayment ? 5 : step === 4 ? 5 : steps[currentIndex + 1]?.id;
    goTo(nextTarget);
  };
  const onInvalid = invalid => {
    const target = ["name", "gender", "email", "password", "college", "rollNumber"].some(field => invalid[field]) ? 0 : invalid.members ? 1 : invalid.events ? 2 : invalid.collegeId ? 3 : invalid.paymentScreenshot ? 4 : 5;
    setStep(target);
    setStepError("Check the highlighted details before submitting.");
  };
  const submitForm = event => {
    if (busy) { event.preventDefault(); return; }
    if (step === 5) return handleSubmit(onSubmit, onInvalid)(event);
    event.preventDefault();
    nextStep();
  };
  const closeModal = () => { if (!busy) setModalOpen(false); };

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <main className="registration-page ui-page text-neutral-100">
      <section className="registration-launch">
        <h1>YOUR NEXT<br /><span>CHALLENGE.</span></h1>
        <button type="button" className="ui-button ui-button-primary" onClick={() => setModalOpen(true)}>{step > 0 ? "Continue registration" : "Start registration"} <span aria-hidden="true">↗</span></button>
      </section>

      <dialog ref={dialog} className="registration-modal" data-lenis-prevent aria-labelledby="registration-dialog-title" onCancel={event => { event.preventDefault(); closeModal(); }}>
        <form onSubmit={submitForm} noValidate aria-busy={busy}>
          <header className="registration-modal-header">
            <div className="registration-modal-brand"><span className="registration-brand-mark">TZ</span><span>TECHNOZION <small>REGISTRATION / 2026</small></span></div>
            <button type="button" className="registration-close" onClick={closeModal} disabled={busy} aria-label="Close registration">×</button>
            <div className="registration-progress" aria-label={`Step ${currentIndex + 1} of ${steps.length}`}>
              {steps.map((item, index) => <span key={item.id} data-complete={index < currentIndex} data-current={index === currentIndex} />)}
            </div>
            <p className="registration-step-kicker" aria-live="polite">STEP {String(currentIndex + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}</p>
            <h2 ref={heading} tabIndex={-1} id="registration-dialog-title">{current.label + "."}</h2>
          </header>
          <div className="registration-modal-body" ref={body}>
          {/* Section 1: Team Lead Details */}
          <section hidden={step !== 0} className="registration-step space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Full Name</label>
                <input
                  placeholder="Your full name"
                  className={inputCls}
                  aria-label="Full name"
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
                  aria-label="Gender"
                  {...register("gender", { required: "Gender is required" })}
                >
                  <option value="" className="bg-ui-input text-ui-muted">Select Gender</option>
                  <option value="male" className="bg-ui-input text-white">Male</option>
                  <option value="female" className="bg-ui-input text-white">Female</option>
                  <option value="other" className="bg-ui-input text-white">Other / Prefer not to say</option>
                </select>
                {errors.gender && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.gender.message}</p>
                )}
              </div>

              <div className="relative">
                <label className={labelCls}>Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className={inputCls}
                    aria-label="Email address"
                    {...register("email", {
                      required: "Email is required",
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" },
                      setValueAs: value => value.trim(),
                    })}
                  />
                </div>
                <p className="text-xs text-ui-muted mt-2">{isNitw ? "NITW student · team fee depends on members." : "NITW students: use your institute email."}</p>
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>
                )}
              </div>

              {isNitw ? (
                <div>
                  <label htmlFor="leader-roll-number" className={labelCls}>NITW Roll Number</label>
                  <input id="leader-roll-number" type="text" autoComplete="off" placeholder="Enter your NITW roll number" className={inputCls} {...register("rollNumber", rollNumberRules)} />
                  {errors.rollNumber && <p className="text-red-400 text-xs mt-1.5">{errors.rollNumber.message}</p>}
                </div>
              ) : null}

              <div>
                <label className={labelCls}>Password</label>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  className={inputCls}
                  aria-label="Password"
                  {...register("password", { 
                    required: "Password is required",
                    minLength: { value: 8, message: "Must be at least 8 characters" }
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
                  aria-label="College / University"
                  {...register("college", { required: "College name is required" })}
                />
                {errors.college && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.college.message}</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-ui-border bg-ui-input p-4 sm:p-5">
              <label className="flex items-center justify-between gap-4 cursor-pointer text-sm font-medium text-white">
                <span>Need accommodation?</span>
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-cyan-400"
                  {...register("needAccommodation")}
                />
              </label>
              <p className="mt-2 text-xs text-ui-muted">
                Accommodation charges are standard and will be shared with you when you arrive.
              </p>
            </div>

          </section>

          <section hidden={step !== 3} className="registration-step space-y-6">
            <h2>Upload your {idLabel.toLowerCase()}</h2>
            <p className="text-sm text-ui-muted">Use a clear PDF, JPG or PNG. Maximum size: 5 MB.</p>
            <div>
              <label htmlFor="college-id" className={labelCls}>Upload {idLabel} (PDF / JPG / PNG)</label>
              <label className="border border-dashed border-ui-border hover:border-ui-accent rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-ui-input hover:bg-ui-input transition-all">
                <input
                  id="college-id"
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  className="sr-only"
                  {...register("collegeId", {
                    required: "ID proof is required",
                    validate: {
                      size: files => !files?.[0] || files[0].size <= 5 * 1024 * 1024 || "ID document must be 5 MB or smaller",
                      type: files => !files?.[0] || ["image/jpeg", "image/png", "application/pdf"].includes(files[0].type) || "Upload a PDF, JPG or PNG",
                    },
                  })}
                />
                <svg className="w-8 h-8 text-ui-muted mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm font-medium text-ui-muted">
                  {collegeIdFile?.[0]?.name ? (
                    <span className="text-ui-accent font-sans">{collegeIdFile[0].name}</span>
                  ) : (
                    "Choose your ID document"
                  )}
                </span>
                <span className="text-xs text-ui-muted mt-1">Maximum size: 5 MB</span>
              </label>
              {errors.collegeId && (
                <p className="text-red-400 text-xs mt-1.5">{errors.collegeId.message}</p>
              )}
            </div>
          </section>

          {/* Section 2: Team Members */}
          <section hidden={step !== 1} className="registration-step space-y-4">
            <div>
              <p className="text-xs text-ui-muted mt-1">
                Four participants, including the team lead.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {Array.from({ length: TEAM_SIZE - 1 }).map((_, i) => {
                const memberStudentType = watch(`members.${i}.studentType`) || "external";

                return (
                  <div key={i}>
                    <label className="block text-xs font-sans uppercase tracking-wider text-ui-muted mb-1">
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
                    {memberStudentType === "nitw" ? (
                      <div className="mt-4">
                        <label htmlFor={`member-${i}-roll`} className={labelCls}>NITW Roll Number</label>
                        <input id={`member-${i}-roll`} type="text" placeholder="Roll number" className={inputCls} {...register(`members.${i}.rollNumber`, rollNumberRules)} />
                        {errors.members?.[i]?.rollNumber && <p className="text-red-400 text-xs mt-1.5">{errors.members[i].rollNumber.message}</p>}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 3: Select Events */}
          <section hidden={step !== 2} className="registration-step space-y-4">
            <div>
              <p className="text-xs text-ui-muted mt-1">
                Click any event to add or remove it from your registration.
              </p>
            </div>

            {eventsLoading ? (
              <EventsLoading variant="choices" />
            ) : registrableEvents.length === 0 ? (
              <div className="text-center py-6 text-ui-muted font-sans text-sm">
                No events available yet.
              </div>
            ) : (
              <div className="space-y-6 pt-1">
                {groupedRegistrableEvents.map((group) => (
                  <div key={group.key} className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-ui-accent">{group.label}</h3>
                    <div className="flex flex-wrap gap-3">
                      {group.events.map((ev) => {
                        const eventVal = ev._id || ev.slug;
                        const isChecked = selectedEventIds.includes(eventVal);

                        return (
                          <label
                            key={eventVal}
                            className={`event-choice inline-flex items-center justify-center px-4 py-2.5 rounded-lg cursor-pointer select-none font-medium text-sm transition-colors border ${
                              isChecked
                                ? "event-choice-selected"
                                : "bg-ui-input border-ui-border"
                            }`}
                          >
                            <input
                              type="checkbox"
                              value={eventVal}
                              className="sr-only"
                              {...register("events", { validate: value => (Array.isArray(value) && value.length > 0) || "Choose at least one event" })}
                            />
                            <span
                              className={`transition-colors duration-150 ${
                                isChecked ? "text-[#092126]" : "text-white"
                              }`}
                            >
                              {ev.name}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {errors.events && <p role="alert" className="registration-error">{errors.events.message}</p>}
          </section>

          {/* Section 4: Payment (Hidden when total is 0) */}
          <section hidden={step !== 4 || total <= 0} className="registration-step space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-ui-muted">Transfer your registration fee to the account below, then attach the payment screenshot.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
                <div className="space-y-4 rounded-xl border border-ui-accent/20 bg-ui-input p-5">
                  <p className="text-xs uppercase tracking-widest font-bold text-ui-accent">Amount to transfer</p>
                  <div className="space-y-1">
                    <p className="text-sm text-ui-muted">
                      {mode === "competition"
                        ? `${competitionCount} Competition${competitionCount > 1 ? "s" : ""} × ₹500`
                        : mode === "gate"
                        ? `Gate Entry · ${externalCount} Member${externalCount === 1 ? "" : "s"} × ₹200`
                        : "No events selected yet"}
                    </p>
                    <div className="text-4xl font-black tracking-tight text-white flex items-baseline gap-2">
                      <span>₹{total}</span>
                      <span className="text-xs font-normal text-ui-muted uppercase font-sans">INR</span>
                    </div>
                  </div>

                  {mode === "gate" && (
                    <div className="text-xs text-ui-muted bg-ui-input border border-ui-border rounded-lg p-3 space-y-1 text-left">
                      <p>🎟️ <strong className="text-white">Gate Entry</strong> — covers access to all Demonstrations &amp; Games.</p>
                      <p>Fee: ₹200 × {externalCount} member{externalCount === 1 ? "" : "s"} = ₹{Math.min(200 * externalCount, 2000)}</p>
                      <p>🏨 <strong className="text-white">Accommodation</strong> — standard fee will be shared with you when you arrive.</p>
                    </div>
                  )}
                  {mode === "competition" && (
                    <div className="text-xs text-ui-muted bg-ui-input border border-ui-border rounded-lg p-3 space-y-1 text-left">
                      <p>🏆 <strong className="text-white">Competition</strong> — charged per event per team.</p>
                      <p>Fee: ₹500 × {competitionCount} event{competitionCount > 1 ? "s" : ""} = ₹{Math.min(500 * competitionCount, 2000)}</p>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-ui-border bg-ui-input p-5 space-y-4">
                  <h3 className="text-sm font-bold text-ui-accent">1. Transfer to this account</h3>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-ui-muted">Name</dt>
                      <dd className="font-semibold text-white">TECHNOZION</dd>
                    </div>
                    <div>
                      <dt className="text-ui-muted">Bank A/c No</dt>
                      <dd className="font-sans text-white break-all">62046706567</dd>
                    </div>
                    <div>
                      <dt className="text-ui-muted">IFSC</dt>
                      <dd className="font-sans text-white">SBIN0020149</dd>
                    </div>
                    <div>
                      <dt className="text-ui-muted">Bank/Branch</dt>
                      <dd className="text-white">SBI NITW</dd>
                    </div>
                  </dl>
                </div>
              </div>

                <div className="border-t border-ui-border pt-6 space-y-3">
                  <label htmlFor="payment-screenshot" className="block text-sm font-bold text-ui-accent">2. Upload payment screenshot</label>
                  <p id="payment-screenshot-help" className="text-xs text-ui-muted">After the transfer succeeds, upload a clear screenshot showing the amount and transaction reference.</p>
                  <label htmlFor="payment-screenshot" className={`relative border border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-ui-input transition-colors focus-within:ring-2 focus-within:ring-ui-accent ${paymentFile?.[0] ? "border-ui-accent" : "border-ui-border hover:border-ui-accent"}`}>
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
                    <svg className="w-8 h-8 text-ui-muted mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm font-medium text-ui-muted">
                      {paymentFile?.[0]?.name ? (
                        <span className="text-ui-accent font-sans break-all">{paymentFile[0].name}</span>
                      ) : (
                        "Choose payment screenshot"
                      )}
                    </span>
                    <span className="text-xs text-ui-muted mt-2">{paymentFile?.[0] ? "Click to replace · JPG / PNG · Up to 5 MB" : "JPG / PNG · Up to 5 MB"}</span>
                  </label>
                  {errors.paymentScreenshot && (
                    <p id="payment-screenshot-error" role="alert" className="text-red-400 text-xs mt-1.5">{errors.paymentScreenshot.message}</p>
                  )}
                </div>
            </section>

            <section hidden={step !== 5} className="registration-step registration-review">
              <div className="registration-review-block"><div className="registration-review-label"><h3>Team lead</h3><button type="button" onClick={() => goTo(0)}>Edit details</button></div><p>{reviewName}</p><p>{watchedEmail}</p><p>{reviewCollege}</p>{isNitw && <p className="text-ui-muted">Roll number: {normalizeRollNumber(watch("rollNumber"))}</p>}<p className="text-ui-muted">Accommodation: {needAccommodation ? "Yes" : "No"}</p></div>
              <div className="registration-review-block"><div className="registration-review-label"><h3>Your teammates</h3><button type="button" onClick={() => goTo(1)}>Edit team</button></div>{watchedMembers.map((member, index) => <p key={index}>{member.name} <span className="text-ui-muted">/ {member.studentType === "nitw" ? `NITW · ${normalizeRollNumber(member.rollNumber)}` : "Other institution"}</span></p>)}</div>
              <div className="registration-review-block"><div className="registration-review-label"><h3>Selected events</h3><button type="button" onClick={() => goTo(2)}>Edit events</button></div>{registrableEvents.filter(event => selectedEventIds.includes(event._id || event.slug)).map(event => <p key={event._id || event.slug}>{event.name}</p>)}</div>
              <div className="registration-review-block"><div className="registration-review-label"><h3>Documents & payment</h3><button type="button" onClick={() => goTo(3)}>Edit documents</button></div><p>{idLabel}: {collegeIdFile?.[0]?.name}</p>{total <= 0 ? <p className="registration-exempt">NITW registration · payment exempt</p> : <><p>Payment screenshot: {paymentFile?.[0]?.name}</p><p className="registration-review-total">Total <strong>₹{total}</strong></p><button type="button" className="registration-text-button" onClick={() => goTo(4)}>Edit payment</button></>}</div>
            </section>
          </div>
          <footer className="registration-modal-footer">
            {stepError && <p className="registration-error" role="alert">{stepError}</p>}
            <div className="registration-footer-actions">
              <button type="button" className="ui-button" disabled={busy} onClick={() => currentIndex > 0 ? goTo(steps[currentIndex - 1].id) : closeModal()}>{currentIndex > 0 ? "Back" : "Close"}</button>
              {step === 5 ? <button key="submit" type="submit" className="ui-button ui-button-primary" disabled={busy}>{authLoading || isSubmitting ? "Uploading & submitting…" : "Submit registration"}</button> : <button key="continue" type="button" className="ui-button ui-button-primary" disabled={busy || (step === 2 && eventsLoading)} onClick={event => { event.preventDefault(); nextStep(); }}>Continue <span aria-hidden="true">→</span></button>}
            </div>
            <p className="registration-help">Need help? <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
          </footer>
        </form>
      </dialog>
    </main>
  );
}
