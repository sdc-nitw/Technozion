import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { API_URL } from "../../config";
import { useAuth } from "../../Context/AuthManager";
import { useSnackbar } from "../../Context/SnackbarProvider";
import { isNitwEmail } from "../utils/registrationChecks";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const FEE_PER_COMPETITION = 350;
const MAX_FEE = 2000;
const categories = [
  { key: "competition", title: "Competitions" },
  { key: "demonstration", title: "Demonstrations" },
  { key: "game", title: "Games" },
];
const computeFee = (competitionCount) =>
  competitionCount === 0
    ? FEE_PER_COMPETITION
    : Math.min(MAX_FEE, FEE_PER_COMPETITION * competitionCount);
const validateUpload = (file) => {
  if (!file) return "";
  const okType = (file.type || "").startsWith("image/") || file.type === "application/pdf";
  if (!okType) return "Please upload an image or a PDF.";
  if (file.size > MAX_UPLOAD_BYTES) return "File is too large (max 5 MB). Please upload a smaller file.";
  return "";
};

// ─── OTP Step Component ────────────────────────────────────────────────────
const OtpVerificationStep = ({ email, onVerified, onCancel }) => {
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | verifying | verified | error
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendOtp = async () => {
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("sent");
        setMessage("OTP sent! Check your inbox (and spam folder).");
        setCooldown(60);
      } else {
        setStatus("error");
        setMessage(data.message || "Failed to send OTP.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setMessage("Please enter the 6-digit OTP.");
      return;
    }
    setStatus("verifying");
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        setStatus("verified");
        setMessage("Email verified successfully!");
        setTimeout(() => onVerified(), 800);
      } else {
        setStatus("sent");
        setMessage(data.message || "Invalid OTP.");
      }
    } catch {
      setStatus("sent");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-darkGray rounded-2xl p-6 md:p-8 max-w-md w-full shadow-lg shadow-cyan/50 animate-fadeIn">
        <h2 className="text-2xl font-bold mb-2 text-cyan text-center">Verify Your Email</h2>
        <p className="text-center text-sm text-white/60 mb-6">
          We need to verify <span className="text-cyan font-medium">{email}</span>
        </p>

        {status === "idle" && (
          <div className="text-center space-y-4">
            <p className="text-sm text-white/70">
              Click the button below to receive a 6-digit OTP on your email.
            </p>
            <button
              onClick={sendOtp}
              className="w-full px-4 py-3 bg-cyan/20 text-white rounded-lg hover:bg-cyan/30 transition font-medium"
            >
              Send OTP
            </button>
          </div>
        )}

        {status === "sending" && (
          <p className="text-center text-cyan animate-pulse">Sending OTP…</p>
        )}

        {(status === "sent" || status === "verifying" || status === "error") && (
          <div className="space-y-4">
            {message && (
              <p className={`text-sm text-center ${status === "error" ? "text-red-400" : "text-green-400"}`}>
                {message}
              </p>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Enter OTP *</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit code"
                className="w-full px-4 py-3 bg-gray rounded-lg text-white text-center text-2xl tracking-widest placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan transition"
              />
            </div>
            <button
              onClick={verifyOtp}
              disabled={status === "verifying"}
              className="w-full px-4 py-3 bg-cyan/20 text-white rounded-lg hover:bg-cyan/30 transition font-medium disabled:opacity-50"
            >
              {status === "verifying" ? "Verifying…" : "Verify OTP"}
            </button>
            <button
              onClick={sendOtp}
              disabled={cooldown > 0 || status === "sending"}
              className="w-full px-4 py-2 text-sm text-cyan/70 hover:text-cyan transition disabled:opacity-40"
            >
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
            </button>
          </div>
        )}

        {status === "verified" && (
          <div className="text-center space-y-3">
            <div className="text-5xl">✅</div>
            <p className="text-green-400 font-semibold">Email verified!</p>
            <p className="text-sm text-white/60">Continuing to registration…</p>
          </div>
        )}

        {status !== "verified" && (
          <button
            onClick={onCancel}
            className="w-full mt-4 px-4 py-2 text-sm text-white/50 hover:text-white/80 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

// ─── QR Payment Modal ──────────────────────────────────────────────────────
const QrPaymentModal = ({
  amount,
  registrationType,
  paymentScreenshot,
  setPaymentScreenshot,
  paymentError,
  setPaymentError,
  onClose,
}) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const problem = validateUpload(file);
    if (problem) {
      setPaymentScreenshot(null);
      setPaymentError(problem);
      e.target.value = "";
      return;
    }
    setPaymentScreenshot(file);
    setPaymentError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-darkGray rounded-2xl p-6 md:p-8 max-w-md w-full shadow-lg shadow-cyan/50 animate-fadeIn max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-1 text-cyan text-center">Payment</h2>
        <p className="text-center text-sm text-white/60 mb-5">
          Scan the QR code below to pay
        </p>

        {/* QR Code */}
        <div className="flex flex-col items-center mb-5">
          <div className="bg-white rounded-xl p-3 mb-3 w-52 h-52 flex items-center justify-center">
            {/* Replace /payment-qr.png with your actual QR image placed in Frontend/public/ */}
            <img
              src="/payment-qr.png"
              alt="Payment QR Code"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='13' fill='%23555'%3EPlace your QR%3C/text%3E%3Ctext x='50%25' y='60%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='13' fill='%23555'%3Eimage at%3C/text%3E%3Ctext x='50%25' y='75%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='12' fill='%23888'%3Epublic/payment-qr.png%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-cyan">₹{amount}</p>
            {registrationType === "team" && (
              <p className="text-xs text-cyan/70 mt-1">One payment covers the entire team</p>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray/40 rounded-lg p-3 mb-5 text-sm text-white/70 space-y-1">
          <p>1. Open any UPI app (GPay, PhonePe, Paytm, etc.)</p>
          <p>2. Scan the QR code above</p>
          <p>3. Pay ₹{amount} and take a screenshot</p>
          <p>4. Upload the screenshot below</p>
        </div>

        {/* Screenshot Upload */}
        <div className="mb-4">
          <label className="block mb-2 font-medium text-white text-sm">
            Upload Payment Screenshot *
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="w-full text-sm text-white file:bg-cyan file:text-black file:px-4 file:py-2 rounded-lg hover:file:bg-cyanLight transition"
          />
          {paymentError && (
            <div className="flex items-center gap-2 mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <span className="text-red-400 text-sm">⚠</span>
              <p className="text-red-400 text-sm">{paymentError}</p>
            </div>
          )}
          {paymentScreenshot && (
            <p className="mt-2 text-green-400 text-sm">✓ Screenshot uploaded: {paymentScreenshot.name}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray/20 hover:bg-gray/30 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-cyan/20 text-white hover:bg-cyan/30 transition font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Register Component ───────────────────────────────────────────────
export const Register = () => {
  const { register: authRegister, loading } = useAuth();
  const [events, setEvents] = useState([]);
  const [eventsError, setEventsError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/events`);
        if (!res.ok) throw new Error(`Events request failed (${res.status})`);
        const data = await res.json();
        setEvents(data.events || []);
        setEventsError("");
      } catch (err) {
        console.error("Failed to fetch JSON:", err);
      }
    };
    fetchData();
  }, []);

  const getCategory = (ev) => {
    const raw = String(ev.eventType || ev.category || ev.type || "").toLowerCase();
    if (raw.startsWith("comp")) return "competition";
    if (raw.startsWith("demo")) return "demonstration";
    if (raw.startsWith("game")) return "game";
    return null;
  };

  const eventsByCategory = React.useMemo(() => {
    const groups = { competition: [], demonstration: [], game: [] };
    events.forEach((ev) => {
      const cat = getCategory(ev);
      if (cat) groups[cat].push(ev);
      else console.warn("Event without valid category:", ev.name);
    });
    return groups;
  }, [events]);

  const eventById = React.useMemo(
    () => Object.fromEntries(events.map((e) => [e._id, e])),
    [events]
  );

  const {
    register: reactRegister,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      registrationType: "individual",
      teamMembers: [],
    },
  });

  const { notify } = useSnackbar();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "teamMembers",
  });

  const watchedEvents = watch("events");
  const watchedEmail = watch("email") || "";
  const watchedRegistrationType = watch("registrationType") || "individual";

  useEffect(() => {
    if (watchedEvents && watchedEvents.length) {
      setSelectedEventsState(Array.isArray(watchedEvents) ? watchedEvents : [watchedEvents]);
    }
  }, [watchedEvents]);

  const [selectedEventsState, setSelectedEventsState] = useState([]);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [paymentError, setPaymentError] = useState("");
  const [idDocument, setIdDocument] = useState(null);
  const [idDocumentError, setIdDocumentError] = useState("");
  const [teamSizeError, setTeamSizeError] = useState("");

  // OTP state
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  const competitionCount = selectedEventsState.filter(
    (id) => eventById[id] && getCategory(eventById[id]) === "competition"
  ).length;
  const registrationFee = computeFee(competitionCount);

  useEffect(() => {
    try {
      reactRegister("events");
    } catch {}
  }, [reactRegister]);

  useEffect(() => {
    if (watchedRegistrationType === "team" && fields.length > 0) {
      setTeamSizeError("");
    }
  }, [fields.length, watchedRegistrationType]);

  // Reset email verification if the email changes
  useEffect(() => {
    setEmailVerified(false);
  }, [watchedEmail]);

  const isValidEmail = (email) => {
    if (!email || typeof email !== "string") return false;
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email.trim().toLowerCase());
  };

  const computeAmount = () => {
    if (watchedEmail && !isNitwEmail(watchedEmail)) return registrationFee;
    return 0;
  };

  const normalizeFirstFile = (maybeFile) => {
    if (!maybeFile) return undefined;
    if (maybeFile instanceof File) return maybeFile;
    if (Array.isArray(maybeFile) && maybeFile[0]) return maybeFile[0];
    return undefined;
  };

  // Called when the form is submitted — opens OTP modal first if not verified
  const onSubmit = async (formData) => {
    try {
      setTeamSizeError("");
      setIdDocumentError("");
      setPaymentError("");

      // Validate events
      const eventsVal = Array.isArray(formData.events)
        ? formData.events
        : formData.events
        ? [formData.events]
        : [];
      if (!eventsVal.length) {
        setError("events", { type: "required", message: "Please select at least one event to participate." });
        return;
      } else {
        clearErrors("events");
      }

      // Validate team
      if (formData.registrationType === "team") {
        const teamSize = 1 + (formData.teamMembers?.length || 0);
        if (teamSize > 5) {
          setTeamSizeError("Maximum team size is 5 members (including you).");
          return;
        }
        if (teamSize < 2) {
          setTeamSizeError("Team must have at least 2 members. Add team members or switch to individual registration.");
          return;
        }
      }

      // College ID must be present
      const idFile = normalizeFirstFile(idDocument);
      if (!idFile) {
        setIdDocumentError("Please upload your College ID document before registering.");
        return;
      }

      // Payment screenshot required if not NITW
      const needsPayment = isValidEmail(watchedEmail) && !isNitwEmail(watchedEmail);
      const payFile = normalizeFirstFile(paymentScreenshot);
      if (needsPayment && !payFile) {
        setPaymentError("Please upload payment screenshot before registering.");
        setPayModalOpen(true);
        return;
      }

      // If email is not verified yet, open OTP modal
      if (!emailVerified) {
        if (!isValidEmail(watchedEmail)) {
          setError("email", { type: "manual", message: "Please enter a valid email address." });
          return;
        }
        setPendingFormData({ ...formData, idDocument: idFile, paymentScreenshot: payFile || undefined });
        setOtpModalOpen(true);
        return;
      }

      // Email already verified — proceed directly
      await submitRegistration({ ...formData, idDocument: idFile, paymentScreenshot: payFile || undefined });
    } catch (err) {
      console.error("Register submit error:", err);
      notify && notify(err.message || "Something went wrong during registration.", { variant: "error" });
    }
  };

  // Called after OTP is successfully verified
  const handleOtpVerified = async () => {
    setEmailVerified(true);
    setOtpModalOpen(false);
    if (pendingFormData) {
      await submitRegistration(pendingFormData);
      setPendingFormData(null);
    }
  };

  const submitRegistration = async (authData) => {
    try {
      await authRegister(authData);
    } catch (err) {
      console.error("Auth register failed", err);
      notify && notify(err?.message || "Registration failed", { variant: "error" });
    }
  };

  return (
    <div className="h-[100vh] bg-black text-white px-4 md:px-8 pb-4 md:pb-8 pt-24 md:pt-32 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-cyan">
            Registration for Technozion 2026
          </h1>
          <h1 className="text-lg font-bold mb-4 text-cyan/80">
            Open to all years and branches from IITs, NITs, IIITs, and leading institutes.
            <span className="text-cyan/50">
              {" "}Free registration for NIT Warangal students
            </span>
          </h1>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm">
            {!(watchedEmail && isNitwEmail(watchedEmail)) && (
              <div className="px-4 py-2 bg-gray rounded-lg">
                Registration fee:{" "}
                <span className="font-semibold text-cyan">₹{registrationFee}</span>
              </div>
            )}
            <div className="px-4 py-2 bg-gray rounded-lg">
              Team size: <span className="font-semibold text-cyan">Up to 5 members</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="bg-darkGray rounded-xl p-6 md:p-8 shadow-lg shadow-cyan/10">
              <h2 className="text-xl font-semibold mb-6 pb-3 border-b border-cyan/30">
                Personal Info
              </h2>
              <div className="space-y-6">
                {/* Registration Type */}
                <div>
                  <label className="block text-sm font-medium mb-3">Registration Type *</label>
                  <div className="flex gap-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        value="individual"
                        {...reactRegister("registrationType")}
                        className="h-4 w-4 accent-cyan"
                      />
                      <span className="text-sm">Individual</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        value="team"
                        {...reactRegister("registrationType")}
                        className="h-4 w-4 accent-cyan"
                      />
                      <span className="text-sm">Team (up to 5)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Name {watchedRegistrationType === "team" && "(Team Leader)"} *
                  </label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    {...reactRegister("name", { required: "Name is required" })}
                    className="w-full px-4 py-3 bg-gray rounded-lg text-white placeholder-grayishWhite/50 focus:outline-none focus:ring-2 focus:ring-cyan transition"
                  />
                  {errors.name && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-red-400 text-sm">⚠</span>
                      <p className="text-red-400 text-sm">{errors.name.message}</p>
                    </div>
                  )}
                </div>

                {/* Email field with verification badge */}
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="your.email@domain.com"
                      {...reactRegister("email", { required: "Email is required" })}
                      className="w-full px-4 py-3 bg-gray rounded-lg text-white placeholder-grayishWhite/50 focus:outline-none focus:ring-2 focus:ring-cyan transition pr-28"
                    />
                    {emailVerified ? (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 text-xs font-semibold flex items-center gap-1">
                        ✓ Verified
                      </span>
                    ) : isValidEmail(watchedEmail) ? (
                      <button
                        type="button"
                        onClick={() => setOtpModalOpen(true)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 bg-cyan/20 text-cyan rounded hover:bg-cyan/30 transition"
                      >
                        Verify
                      </button>
                    ) : null}
                  </div>
                  {errors.email && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-red-400 text-sm">⚠</span>
                      <p className="text-red-400 text-sm">{errors.email.message}</p>
                    </div>
                  )}
                  {!emailVerified && isValidEmail(watchedEmail) && (
                    <p className="text-xs text-yellow-400 mt-1">
                      ⚠ Email not verified — you'll be prompted to verify before submitting.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Password *</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    {...reactRegister("password", {
                      required: "Password is required",
                      minLength: { value: 8, message: "Use at least 8 characters" },
                    })}
                    className="w-full px-4 py-3 bg-gray rounded-lg text-white placeholder-grayishWhite/50 focus:outline-none focus:ring-2 focus:ring-cyan transition"
                  />
                  {errors.password && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-red-400 text-sm">⚠</span>
                      <p className="text-red-400 text-sm">{errors.password.message}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">College *</label>
                  <input
                    type="text"
                    placeholder="Enter college name"
                    {...reactRegister("collegeName", { required: "College name is required" })}
                    className="w-full px-4 py-3 bg-gray rounded-lg text-white placeholder-grayishWhite/50 focus:outline-none focus:ring-2 focus:ring-cyan transition"
                  />
                  {errors.collegeName && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-red-400 text-sm">⚠</span>
                      <p className="text-red-400 text-sm">{errors.collegeName.message}</p>
                    </div>
                  )}
                </div>

                {/* Team Members */}
                {watchedRegistrationType === "team" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium">Team Members *</label>
                      <span className="text-xs text-cyan/70">
                        {fields.length + 1} / 5 members
                      </span>
                    </div>

                    {teamSizeError && (
                      <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded-lg">
                        <span className="text-red-400 text-sm">⚠</span>
                        <p className="text-red-400 text-sm">{teamSizeError}</p>
                      </div>
                    )}

                    {fields.map((field, index) => (
                      <div key={field.id}>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder={`Team member ${index + 2} name`}
                            {...reactRegister(`teamMembers.${index}.name`, {
                              required: "Team member name is required",
                            })}
                            className="flex-1 px-4 py-3 bg-gray rounded-lg text-white placeholder-grayishWhite/50 focus:outline-none focus:ring-2 focus:ring-cyan transition"
                          />
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition text-red-400"
                          >
                            Remove
                          </button>
                        </div>
                        {errors.teamMembers?.[index]?.name && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-red-400 text-sm">⚠</span>
                            <p className="text-red-400 text-sm">
                              {errors.teamMembers[index].name.message}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}

                    {fields.length < 4 && (
                      <button
                        type="button"
                        onClick={() => append({ name: "" })}
                        className="w-full px-4 py-3 bg-cyan/10 hover:bg-cyan/20 rounded-lg transition font-medium text-cyan"
                      >
                        + Add Team Member
                      </button>
                    )}
                  </div>
                )}

                <div className="flex items-center space-x-3 p-4 bg-gray rounded-lg">
                  <input
                    id="accommodation"
                    type="checkbox"
                    {...reactRegister("accommodation")}
                    className="h-5 w-5 accent-cyan"
                  />
                  <label htmlFor="accommodation" className="text-sm font-medium">
                    Need accommodation
                  </label>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Upload College ID *</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      const problem = validateUpload(file);
                      if (problem) {
                        setIdDocument(null);
                        setIdDocumentError(problem);
                        e.target.value = "";
                        return;
                      }
                      setIdDocument(file);
                      setIdDocumentError("");
                    }}
                    className="w-full text-sm text-white file:bg-cyan file:text-black file:px-4 file:py-2 rounded-lg hover:file:bg-cyanLight transition"
                  />
                  {idDocumentError && (
                    <div className="flex items-center gap-2 mt-2 p-3 bg-red-500/10 rounded-lg">
                      <span className="text-red-400 text-sm">⚠</span>
                      <p className="text-red-400 text-sm">{idDocumentError}</p>
                    </div>
                  )}
                </div>

                {/* QR Payment section (for non-NITW emails) */}
                {isValidEmail(watchedEmail) && !isNitwEmail(watchedEmail) && (
                  <div className="pt-6">
                    <div className="bg-gray rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium">Registration Fee</span>
                        <span className="text-xl font-bold text-cyan">₹{computeAmount()}</span>
                      </div>
                      {watchedRegistrationType === "team" && (
                        <p className="text-xs text-cyan/70 mb-3">
                          One-time payment for entire team
                        </p>
                      )}
                      {paymentScreenshot ? (
                        <div className="space-y-2">
                          <p className="text-green-400 text-sm">✓ Screenshot uploaded: {paymentScreenshot.name}</p>
                          <button
                            type="button"
                            onClick={() => setPayModalOpen(true)}
                            className="w-full px-4 py-2 bg-cyan/10 text-cyan rounded-lg hover:bg-cyan/20 transition text-sm"
                          >
                            Change Screenshot / View QR
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPayModalOpen(true)}
                          className="w-full px-4 py-3 bg-cyan/20 text-white rounded-lg hover:bg-cyan/30 transition font-medium"
                        >
                          Pay via QR & Upload Screenshot
                        </button>
                      )}
                      {paymentError && !payModalOpen && (
                        <p className="text-red-400 text-sm mt-2">⚠ {paymentError}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Event Selection */}
            <div className="bg-darkGray rounded-xl p-6 md:p-8 shadow-lg shadow-cyan/10">
              <h2 className="text-xl font-semibold mb-6 pb-3 border-b border-cyan/30">
                Event Selection
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3">Select Events *</label>

                  {errors.events && (
                    <div className="flex items-center gap-2 mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <span className="text-red-400 text-sm">⚠</span>
                      <p className="text-red-400 text-sm">{errors.events.message}</p>
                    </div>
                  )}

                  {eventsError && (
                    <div className="flex items-center gap-2 mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <span className="text-red-400 text-sm">⚠</span>
                      <p className="text-red-400 text-sm">{eventsError}</p>
                    </div>
                  )}

                  <div className="min-h-[120px] p-4 bg-gray rounded-lg mb-4">
                    {selectedEventsState.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedEventsState.map((id) => (
                          <span
                            key={id}
                            className="inline-flex items-center px-3 py-1 bg-cyan/20 text-sm rounded-full"
                          >
                            {eventById[id]?.name || id}
                            <button
                              type="button"
                              onClick={() => {
                                const next = selectedEventsState.filter((e) => e !== id);
                                setSelectedEventsState(next);
                                setValue("events", next, { shouldValidate: true });
                              }}
                              className="ml-2 text-white hover:text-cyan"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-grayishWhite/50 text-sm text-center">
                        No events selected yet
                      </div>
                    )}
                  </div>

                  <div className="space-y-6 max-h-[500px] overflow-y-auto">
                    {categories.map(({ key, title }) => (
                      <div key={key} className="mb-4">
                        <h3 className="text-lg font-semibold mb-2 border-b border-cyan/30 pb-1">
                          {title}
                          {key === "competition" && (
                            <span className="ml-2 text-xs font-normal text-cyan/70">
                              ₹{FEE_PER_COMPETITION} each, max ₹{MAX_FEE}
                            </span>
                          )}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {eventsByCategory[key].length === 0 && (
                            <p className="text-sm text-grayishWhite/50">No events available</p>
                          )}
                          {eventsByCategory[key].map((ev) => {
                            const isSelected = selectedEventsState.includes(ev._id);
                            return (
                              <label
                                key={ev._id}
                                onClick={(e) => {
                                  e.preventDefault();
                                  const next = !isSelected
                                    ? [...selectedEventsState, ev._id]
                                    : selectedEventsState.filter((x) => x !== ev._id);
                                  setSelectedEventsState(next);
                                  setValue("events", next, { shouldValidate: true });
                                  if (next.length > 0) clearErrors("events");
                                }}
                                className={`flex items-center p-2 rounded-lg cursor-pointer transition hover:bg-gray ${
                                  isSelected ? "bg-cyan/20" : "bg-black/10"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  readOnly
                                  className="sr-only"
                                />
                                <span className="text-sm font-medium">
                                  {ev.name || ev.title || "Unnamed Event"}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 mb-20 text-center">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-cyan/20 rounded-xl hover:bg-cyan/30 transition font-semibold text-lg shadow-lg hover:shadow-cyan/30 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? "Submitting..." : "Complete Registration"}
            </button>
            <br />
          </div>
        </form>
      </div>

      {/* QR Payment Modal */}
      {payModalOpen && (
        <QrPaymentModal
          amount={computeAmount()}
          registrationType={watchedRegistrationType}
          paymentScreenshot={paymentScreenshot}
          setPaymentScreenshot={setPaymentScreenshot}
          paymentError={paymentError}
          setPaymentError={setPaymentError}
          onClose={() => setPayModalOpen(false)}
        />
      )}

      {/* OTP Verification Modal */}
      {otpModalOpen && (
        <OtpVerificationStep
          email={watchedEmail}
          onVerified={handleOtpVerified}
          onCancel={() => {
            setOtpModalOpen(false);
            setPendingFormData(null);
          }}
        />
      )}
    </div>
  );
};

export default Register;
