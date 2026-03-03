import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../services/api";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");

    try {
      const { data } = await authApi.forgotPassword(email);
      setStatus(data.message + (data.resetUrl ? ` ${data.resetUrl}` : ""));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to process request.");
    }
  };

  return (
    <div className="auth-bg flex min-h-[100dvh] items-center justify-center px-3 sm:px-4">
      <form onSubmit={handleSubmit} className="glass-card reveal-up w-full max-w-md space-y-4 rounded-3xl p-5 sm:p-6">
        <h1 className="text-2xl font-bold">Forgot Password</h1>
        <p className="text-sm text-slate-300">Enter your email to generate a reset link.</p>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-white/20 bg-slate-900/55 px-4 py-3" placeholder="Email" required />
        {status && <p className="text-xs text-emerald-300">{status}</p>}
        {error && <p className="text-xs text-rose-300">{error}</p>}
        <button className="gradient-btn w-full rounded-xl px-4 py-3 font-semibold text-white">Send Reset Link</button>
        <Link to="/login" className="text-sm text-teal-200">Back to login</Link>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
