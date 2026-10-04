import React, { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader } from '../components/Loader'
import { useSnackbar } from './SnackbarProvider'
import {API_URL} from '../config'
import { isNitwEmail } from '../components/utils/registrationChecks'

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
        // show error snackbar
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
  try {
    // Helper: upload a file to Cloudinary and return the URL
    const uploadToCloudinary = async (file) => {
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
        const err = new Error('File upload failed. Please try again.');
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
      idDocumentUrl = await uploadToCloudinary(idFile);
    } else {
      notify('Please upload your College ID/Aadhar.', { variant: 'error' })
      setLoading(false);
      return;
    }

    // Upload Payment Screenshot if needed
    let paymentScreenshotUrl = null;
    const emailDomain = (registrationData.email || "").trim().toLowerCase().split("@")[1];
    if (!emailDomain) {
      notify('Please enter a valid email address.', { variant: 'error' })
      setLoading(false);
      return;
    }
    if (!isNitwEmail(registrationData.email)) {
      if (registrationData.paymentScreenshot) {
        const paymentFile = Array.isArray(registrationData.paymentScreenshot)
          ? registrationData.paymentScreenshot[0]
          : registrationData.paymentScreenshot;
        paymentScreenshotUrl = await uploadToCloudinary(paymentFile);
      } else {
        notify('Please upload a payment screenshot for non-nitw emails.', { variant: 'error' })
        setLoading(false);
        return;
      }
    }
    

    // Prepare payload for backend
    const payload = {
      name: registrationData.name || "",
      email: registrationData.email || "",
      password: registrationData.password || "",
      collegeName: registrationData.collegeName || "",
      accommodation: registrationData.accommodation || false,
      events: registrationData.events || [],
      teamMembers: registrationData.registrationType === "team" ? (registrationData.teamMembers || []) : [],
      registrationType: registrationData.registrationType,
      idDocumentUrl,
      paymentScreenshotUrl,
    };
    // Send JSON with URLs to backend
    const res = await fetch(`${url}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
      persistSession(data);
      setUser(data.user);
      notify('Registration successful!', { variant: 'success' })
      navigate("/");
    } else {
      console.log("register error", data);
      notify(data.message || "Registration failed", { variant: 'error' })
    }
  } catch (err) {
    console.log(err);
    notify(err.isUpload ? err.message : 'Something went wrong during registration.',{ variant: 'error' })
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
