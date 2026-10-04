import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { API_URL } from "../../config";
import { useAuth } from "../../Context/AuthManager";
import { useSnackbar } from "../../Context/SnackbarProvider";
import { isNitwEmail } from "../utils/registrationChecks";
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const validateUpload = (file) => {
  if (!file) return "";
  const okType = (file.type || "").startsWith("image/") || file.type === "application/pdf";
  if (!okType) return "Please upload an image or a PDF.";
  if (file.size > MAX_UPLOAD_BYTES) return "File is too large (max 5 MB). Please upload a smaller file.";
  return "";
};

export const Register = () => {
  const { register: authRegister, loading } = useAuth();
  // const [societies, setSocieties] = useState([]);
  // const [clubs, setClubs] = useState([]);
  // const [workshops, setWorkshops] = useState([])
  const [events, setEvents] = useState([]);
  const [eventsError, setEventsError] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      try {
        // const clubsRes = await fetch("/dataJSON/club.json");
        // const societiesRes = await fetch("/dataJSON/societyx.json");
        // const workshopRes = await fetch('/dataJSON/workshop.json')

        // const societiesData = await societiesRes.json();
        // const clubsData = await clubsRes.json();
        // const workshopsData = await workshopRes.json()

        // setSocieties(societiesData);
        // setClubs(clubsData);
        // setWorkshops(workshopsData)
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

  // const finalData = React.useMemo(() => {
  //   const map = new Map();

    
  //   clubs.forEach(club => {
  //     if (map.has(club.name)) {
  //       map.get(club.name).events.push({ ...club, displayName: club.title || club.name });
  //     } else {
  //       map.set(club.name, { societyName: club.name, events: [{ ...club, displayName: club.title || club.name }] });
  //     }
  //   });
    
  //   societies.forEach(soc => {
  //     map.set(soc.societyName, {
  //       societyName: soc.societyName,
  //       events: soc.events.map(ev => ({ ...ev, displayName: ev.title || ev.name }))
  //     });
  //   });

  //   workshops.forEach(wk => {
      
  //    if (map.has(wk.name)) {
     
  //       map.get(wk.name).events.push({ ...wk, displayName: wk.title || wk.name });
  //     } else {
  //       map.set(wk.name, { societyName: wk.name, events: [{ ...wk, displayName: wk.title || wk.name }] });
  //     }
  //   })


    
  //   return Array.from(map.values());
  // }, [societies, clubs, workshops]);
  const finalData = React.useMemo(() => {
    const map = new Map();
    events.forEach(ev => {
      const groupName = ev.club || "Other";
      const eventWithDisplay = { ...ev, displayName: ev.name };
      if (map.has(groupName)) {
        map.get(groupName).events.push(eventWithDisplay);
      } else {
        map.set(groupName, { societyName: groupName, events: [eventWithDisplay] });
      }
    });
    return Array.from(map.values());
  }, [events]);
  // console.log(finalData)
  const eventNameById = React.useMemo(
    () => Object.fromEntries(events.map((e) => [e._id, e.name])),
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
    }
  });

  const { notify } = useSnackbar();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "teamMembers"
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

  useEffect(() => {
    try {
      reactRegister("events");
    } catch { }
  }, [reactRegister]);

  // Clear team size error when team members change
  useEffect(() => {
    if (watchedRegistrationType === "team" && fields.length > 0) {
      setTeamSizeError("");
    }
  }, [fields.length, watchedRegistrationType]);

  const isValidEmail = (email) => {
    if (!email || typeof email !== "string") return false;
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email.trim().toLowerCase());
  };

  const computeAmount = () => {
    if (watchedEmail && !isNitwEmail(watchedEmail)) return 500;
    return 0;
  };

  const normalizeFirstFile = (maybeFile) => {
    if (!maybeFile) return undefined;
    if (maybeFile instanceof File) return maybeFile;
    if (Array.isArray(maybeFile) && maybeFile[0]) return maybeFile[0];
    return undefined;
  };

  // const uploadToCloudinary = async (file) => {
  //   const cloudName = "dpjrslhwg";
  //   const uploadPreset = "technozian_upload";

  //   const formData = new FormData();
  //   formData.append("file", file);
  //   formData.append("upload_preset", uploadPreset);

  //   const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
  //     method: "POST",
  //     body: formData,
  //   });

  //   const data = await res.json();
  //   return data.secure_url;
  // };

  const onSubmit = async (formData) => {
    try {
      // Reset custom errors
      setTeamSizeError("");
      setIdDocumentError("");
      setPaymentError("");

      // Validate events selection
      const eventsVal = Array.isArray(formData.events) ? formData.events : (formData.events ? [formData.events] : []);
      if (!eventsVal.length) {
        setError("events", { type: "required", message: "Please select at least one event to participate." });
        return;
      } else {
        clearErrors("events");
      }

      // Validate team registration
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

      // Payment screenshot required if email not nitw.ac.in
      const needsPayment = isValidEmail(watchedEmail) && !isNitwEmail(watchedEmail);
      const payFile = normalizeFirstFile(paymentScreenshot);
      if (needsPayment && !payFile) {
        setPaymentError("Please upload payment screenshot before registering.");
        setPayModalOpen(true);
        return;
      }

      // Generate password
      // const rand8 = Math.floor(10000000 + Math.random() * 90000000);
      // const password = String(rand8);



      // Preserve original behavior
      const authData = {
        ...formData,
        idDocument: idFile,
        paymentScreenshot: payFile || undefined,
      };

      // console.log("Registering with data", authData);
      // notify && notify('Submitting registration...', { variant: 'info' })
      try {
        await authRegister(authData);
        // notify && notify('Registration submitted successfully', { variant: 'success' })
      } catch (err) {
        console.error('Auth register failed', err)
        notify && notify(err?.message || 'Registration failed', { variant: 'error' })
      }

      setPayModalOpen(false);
    } catch (err) {
      console.error("Register submit error:", err);
      notify && notify(err.message || "Something went wrong during registration.", { variant: 'error' });
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
            <div className="px-4 py-2 bg-gray rounded-lg">
              Registration fee: <span className="font-semibold text-cyan">₹500</span>
            </div>
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

                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    placeholder="your.email@domain.com"
                    {...reactRegister("email", { required: "Email is required" })}
                    className="w-full px-4 py-3 bg-gray rounded-lg text-white placeholder-grayishWhite/50 focus:outline-none focus:ring-2 focus:ring-cyan transition"
                  />
                  {errors.email && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-red-400 text-sm">⚠</span>
                      <p className="text-red-400 text-sm">{errors.email.message}</p>
                    </div>
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

                {/* Team Members Fields */}
                {watchedRegistrationType === "team" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium">Team Members *</label>
                      <span className="text-xs text-cyan/70">
                        {fields.length + 1} / 5 members
                      </span>
                    </div>

                    {teamSizeError && (
                      <div className="flex items-center gap-2 p-3 bg-red-500/10  rounded-lg">
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
                              required: "Team member name is required"
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
                    <div className="flex items-center gap-2 mt-2 p-3 bg-red-500/10  rounded-lg">
                      <span className="text-red-400 text-sm">⚠</span>
                      <p className="text-red-400 text-sm">{idDocumentError}</p>
                    </div>
                  )}
                </div>

                {(isValidEmail(watchedEmail) && !isNitwEmail(watchedEmail)) && (
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
                      <button
                        type="button"
                        onClick={() => setPayModalOpen(true)}
                        className="w-full px-4 py-3 bg-cyan/20 text-white rounded-lg hover:bg-cyan/30 transition font-medium"
                      >
                        Pay & Upload Screenshot
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

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
                        {selectedEventsState.map((event, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-3 py-1 bg-cyan/20 text-sm rounded-full"
                          >
                            {eventNameById[event] || event}
                            <button
                              type="button"
                              onClick={() => {
                                const next = selectedEventsState.filter((e) => e !== event);
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
                    {finalData.map((item) => (
                      <div key={item.societyName} className="mb-4">
                        <h3 className="text-lg font-semibold mb-2 border-b border-cyan/30 pb-1">{item.societyName}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.events.map((ev, i) => {
                            const eventName = ev.displayName || "Unnamed Event";
                            const isSelected = selectedEventsState.includes(ev._id);

                            return (
                              <label
                                key={ev._id || i}
                                onClick={(e) => {
                                  e.preventDefault();
                                  const next = !isSelected
                                    ? [...selectedEventsState, ev._id]
                                    : selectedEventsState.filter((x) => x !== ev._id);
                                  setSelectedEventsState(next);
                                  setValue("events", next, { shouldValidate: true });
                                  if (next.length > 0) {
                                    clearErrors("events");
                                  }
                                }}
                                className={`flex items-center p-2 rounded-lg cursor-pointer transition hover:bg-gray ${isSelected ? "bg-cyan/20" : "bg-black/10"}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  readOnly
                                  className="sr-only"
                                />
                                <span className="text-sm font-medium">{eventName}</span>
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

      {payModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-darkGray rounded-2xl p-6 md:p-8 max-w-md w-full shadow-lg shadow-cyan/50 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4 text-cyan text-center">
              Payment Details
            </h2>

            <div className="mb-6 text-white space-y-2 text-sm">
              <p className="font-medium">Bank Account Info:</p>
              <p>Account Name: <span className="font-semibold uppercase">Technozion</span></p>
              <p>Account No: <span className="font-semibold">62046706567</span></p>
              <p>IFSC: <span className="font-semibold">SBIN0020149</span></p>
              <p>Bank: <span className="font-semibold">SBI</span></p>
            </div>
            {watchedRegistrationType === "team" && (
              <p className="text-cyan/80 mt-3 pt-3 border-t border-cyan/30">
                ℹ️ One payment covers the entire team
              </p>
            )}

            <div className="mb-6">
              <label className="block mb-2 font-medium text-white">Upload Payment Screenshot *</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
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
                 }}
                className="w-full text-sm text-white file:bg-cyan file:text-black file:px-4 file:py-2 rounded-lg hover:file:bg-cyanLight transition"
              />
              {paymentError && (
                <div className="flex items-center gap-2 mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <span className="text-red-400 text-sm">⚠</span>
                  <p className="text-red-400 text-sm">{paymentError}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button

                onClick={() => setPayModalOpen(false)}
                className="px-5 py-2 rounded-lg bg-gray/20 hover:bg-gray/30 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => setPayModalOpen(false)}
                className="px-5 py-2 rounded-lg bg-cyan/20 text-white hover:bg-cyan/30 transition font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
