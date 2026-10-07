import React, { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { API_URL } from "../../config";
import { useAuth } from "../../Context/AuthManager";
import { useSnackbar } from "../../Context/SnackbarProvider";
const inputClass =
  "w-full px-4 py-3 bg-gray rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan transition";

const FieldError = ({ error }) =>
  error ? (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-red-400 text-sm">⚠</span>
      <p className="text-red-400 text-sm">{error.message}</p>
    </div>
  ) : null;

export const Login = () => {
  const { user, login, loading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { notify } = useSnackbar();
const location = useLocation();
// email that still needs verifying (set after signing up, or after a blocked login)
const [pendingEmail, setPendingEmail] = useState((location.state && location.state.verifyEmail) || "");
const [resending, setResending] = useState(false);
if (user) return <Navigate to="/" replace />;
const onSubmit = async ({ email, password }) => {
  const result = await login(email.trim(), password);
  if (result && result.notVerified) setPendingEmail(result.email);
};

const resendVerification = async () => {
  if (!pendingEmail || resending) return;
  setResending(true);
  try {
    const res = await fetch(`${API_URL}/api/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: pendingEmail }),
    });
    const data = await res.json();
    notify(data.message || (res.ok ? "Verification email sent." : "Could not resend the email."), {
      variant: res.ok ? "success" : "error",
    });
  } catch {
    notify("Couldn't reach the server. Please try again.", { variant: "error" });
  } finally {
    setResending(false);
  }
};
  return (
    <div className="min-h-screen bg-black text-white px-4 pt-28 pb-12 flex flex-col items-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-cyan">Login</h1>
          <p className="text-cyan/70 text-sm">
            Sign in with the email and password you registered with.
          </p>
        </div>

        {pendingEmail && (
          <div className="mb-6 p-4 rounded-lg bg-black/40 border border-cyan/30 text-sm">
            <p>
              Your email <span className="font-semibold text-cyan">{pendingEmail}</span> isn't
              verified yet. Open the link we emailed you, then log in here.
            </p>
            <button
              type="button"
              onClick={resendVerification}
              disabled={resending}
              className="mt-3 px-4 py-2 rounded-lg bg-cyan/20 hover:bg-cyan/30 transition font-semibold disabled:opacity-50"
            >
              {resending ? "Sending…" : "Resend verification email"}
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="bg-darkGray rounded-xl p-6 md:p-8 shadow-lg shadow-cyan/10 space-y-6"
        >
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="your.email@domain.com"
              {...register("email", { required: "Email is required" })}
              className={inputClass}
            />
            <FieldError error={errors.email} />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              {...register("password", { required: "Password is required" })}
              className={inputClass}
            />
            <FieldError error={errors.password} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-8 py-3 bg-cyan/20 rounded-xl hover:bg-cyan/30 transition font-semibold text-lg disabled:opacity-50"
           >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-white/70">
          Not registered yet?{" "}
          <Link to="/register" className="text-cyan hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};