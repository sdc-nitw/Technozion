import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { API_URL } from "../../config";

// Opened from the link in the verification email: /verify-email?token=...
const VerifyEmail = () => {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [status, setStatus] = useState(token ? "loading" : "error");
  const [message, setMessage] = useState(token ? "" : "This verification link is invalid.");

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (cancelled) return;
        setStatus(res.ok ? "success" : "error");
        setMessage(data.message || (res.ok ? "Email verified." : "Could not verify your email."));
      } catch {
        if (cancelled) return;
        setStatus("error");
        setMessage("Couldn't reach the server. Please try again in a moment.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-black text-white px-4 pt-28 pb-12 flex flex-col items-center">
      <div className="w-full max-w-md bg-darkGray rounded-xl p-6 md:p-8 shadow-lg shadow-cyan/10 text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-cyan">Email verification</h1>
        {status === "loading" && <p className="text-white/70">Verifying your email…</p>}
        {status !== "loading" && (
          <p className={status === "success" ? "text-green-300" : "text-red-400"}>{message}</p>
        )}
        {status !== "loading" && (
          <Link
            to="/login"
            className="inline-block mt-6 px-6 py-3 rounded-xl bg-cyan/20 hover:bg-cyan/30 transition font-semibold"
          >
            {status === "success" ? "Go to login" : "Back to login"}
          </Link>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;