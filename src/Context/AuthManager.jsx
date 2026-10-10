import React, { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader } from '../components/Loader'
import { useSnackbar } from './SnackbarProvider'
import {API_URL} from '../config'
import { isNitwEmail, isValidNitwRollNumber, normalizeRollNumber } from '../components/utils/registrationChecks'
import { countExternalParticipants, normalizeStudentType } from '../components/Register2/feeUtils'

const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem('user_info')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') return parsed
  } catch {}
  try { localStorage.removeItem('user_info') } catch {}
  return null
}
const persistSession = (data) => {
  try {
    localStorage.setItem('user_info', JSON.stringify(data.user))
    localStorage.setItem('token', data.token)
  } catch (err) {
    console.warn('Could not persist session:', err)
  }
}
const clearSession = () => {
  try {
    localStorage.removeItem('user_info')
    localStorage.removeItem('token')
  } catch (err) {
    console.warn('Could not clear session:', err)
  }
}
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser)
  const [loading, setLoading] = useState(false)
  const [pendingLogout, setPendingLogout] = useState(false)
  const navigate = useNavigate()
  const url = API_URL;
  const { notify } = useSnackbar()
  const login = async (email, password) => {
    setLoading(true)
    try {
      const res = await fetch(`${url}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (res.ok) {
        persistSession(data)
        setUser(data.user)
        navigate('/')
      } else {
        notify(data.message || 'Login failed', { variant: 'error' })
      }
    } catch (err) {
    console.log(err)
    notify('Something went wrong during login', { variant: 'error' })
    }
    finally { setLoading(false) }
  }

  // register accepts a single object with fields used by the frontend form.
  // It supports File, FileList or array for idDocument and paymentScreenshot.
  const register = async (registrationData) => {
  if(loading) return;
  setLoading(true);
  let requestStage = "registration";
  try {
    const emailIsNitw = isNitwEmail(registrationData.email);
    const teamMembers = Array.isArray(registrationData.teamMembers) ? registrationData.teamMembers.map((member) => ({
      ...member,
      studentType: normalizeStudentType(member?.studentType),
      rollNumber: normalizeStudentType(member?.studentType) === 'nitw' ? normalizeRollNumber(member?.rollNumber) : undefined,
    })) : [];
    const requiresPayment = countExternalParticipants({
      isNitwLead: emailIsNitw,
      members: teamMembers,
    }) > 0;

    if (emailIsNitw && !isValidNitwRollNumber(registrationData.rollNumber)) {
      notify('Please enter your NITW roll number.', { variant: 'error' });
      return { ok: false, message: 'Please enter your NITW roll number.' };
    }
    // Helper: upload a file to Cloudinary and return the URL
    const uploadToCloudinary = async (file, label) => {
      requestStage = label;
      const cloudName = "dpjrslhwg"; // replace with your Cloudinary cloud name
      const uploadPreset = "technozian_upload"; // replace with your preset
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
        method: "POST",
        body: formData,
      });
      let data = {};
      try { data = await res.json(); } catch {}
      if (!res.ok || !data.secure_url) {
        const reason = typeof data.error?.message === 'string' ? ` ${data.error.message}` : '';
        const err = new Error(`${label} upload failed (${res.status}).${reason} Please try again.`);
        err.isUpload = true;
        throw err;
      }
      return data.secure_url; // return the uploaded file URL
    };

    // Upload ID Document
    let idDocumentUrl = null;
    if (registrationData.idDocument) {
      const idFile = Array.isArray(registrationData.idDocument)
        ? registrationData.idDocument[0]
        : registrationData.idDocument;
      idDocumentUrl = await uploadToCloudinary(idFile, "ID document");
    } else {
      notify('Please upload your College ID/Aadhar.', { variant: 'error' })
      setLoading(false);
      return { ok: false, message: 'Please upload your College ID/Aadhar.' };
    }

    // Upload Payment Screenshot if needed
    let paymentScreenshotUrl = null;
    const emailDomain = (registrationData.email || "").trim().toLowerCase().split("@")[1];
    if (!emailDomain) {
      notify('Please enter a valid email address.', { variant: 'error' })
      setLoading(false);
      return { ok: false, message: 'Please enter a valid email address.' };
    }
    if (requiresPayment && registrationData.paymentScreenshot) {
      const paymentFile = Array.isArray(registrationData.paymentScreenshot)
        ? registrationData.paymentScreenshot[0]
        : registrationData.paymentScreenshot;
      paymentScreenshotUrl = await uploadToCloudinary(paymentFile, "Payment screenshot");
    }
    

    // Prepare payload for backend
    const payload = {
      name: registrationData.name || "",
      email: registrationData.email || "",
      rollNumber: emailIsNitw ? normalizeRollNumber(registrationData.rollNumber) : undefined,
      password: registrationData.password || "",
      collegeName: registrationData.collegeName || "",
      accommodation: !!(registrationData.accommodation ?? registrationData.needAccommodation ?? registrationData.needAccomodation),
      needAccommodation: !!(registrationData.needAccommodation ?? registrationData.accommodation ?? registrationData.needAccomodation),
      needAccomodation: !!(registrationData.needAccomodation ?? registrationData.needAccommodation ?? registrationData.accommodation),
      events: registrationData.events || [],
      teamMembers: registrationData.registrationType === "team" ? teamMembers.map((member) => ({
        name: member?.name || "",
        studentType: normalizeStudentType(member?.studentType),
        rollNumber: normalizeStudentType(member?.studentType) === 'nitw' ? normalizeRollNumber(member?.rollNumber) : undefined,
      })) : [],
      registrationType: registrationData.registrationType,
      idDocumentUrl,
      paymentScreenshotUrl,
    };
    // Send JSON with URLs to backend
    requestStage = "registration";
    const res = await fetch(`${url}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });

    let data;
    try {
      data = await res.json();
      if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid response');
    } catch {
      const message = res.ok
        ? 'The server returned an invalid registration confirmation. Check whether your account was created before submitting again.'
        : `Registration service returned an invalid response (${res.status}). Please check that the backend is running and the API address is correct.`;
      notify(message, { variant: 'error' });
      return { ok: false, message };
    }
    if (res.ok) {
    notify(data.message || 'Account created successfully.', { variant: 'success' })
    navigate("/registration-complete", { state: { participants: data.participants || [] } });
    return { ok: true };
    }
    else {
      console.log("register error", data);
      const message = typeof data.message === 'string' && data.message.trim()
        ? data.message
        : `Registration failed (${res.status}). Please try again.`;
      notify(message, { variant: 'error' });
      return { ok: false, message };
    }
  } catch (err) {
    console.log(err);
    const message = err.isUpload ? err.message : requestStage !== 'registration'
      ? `Could not upload your ${requestStage.toLowerCase()}. Check your connection and try again.`
      : 'Could not reach the registration service. Check that the backend is running and try again.';
    notify(message, { variant: 'error' });
    return { ok: false, message };
  } finally {
    setLoading(false);
  }
};


  const logout = () => {
    // two-step snackbar-based confirmation: first click asks user to click again within 5s
    if (!pendingLogout) {
      setPendingLogout(true)
      notify('Click logout again to confirm', { variant: 'info', duration: 5000 })
      // reset pending state after a short window
      setTimeout(() => setPendingLogout(false), 5000)
      return
    }

    // confirmed
    clearSession()
    setUser(null)
    setPendingLogout(false)
    notify('Logged out', { variant: 'success' })
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, setLoading }}>
      {/* {loading ? <Loader /> : children} */}
      {loading && <Loader />}
      {children}    
    </AuthContext.Provider>
  )
}


export default AuthProvider
