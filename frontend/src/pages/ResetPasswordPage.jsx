import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { authApi } from "../services/api";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await authApi.resetPassword(token, password);
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="auth-bg flex min-h-[100dvh] items-center justify-center px-3 sm:px-4">
      <form onSubmit={handleSubmit} className="glass-card reveal-up w-full max-w-md space-y-4 rounded-3xl p-5 sm:p-6">
        <h1 className="text-2xl font-bold">Reset Password</h1>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-white/20 bg-slate-900/55 px-4 py-3" placeholder="New password" required />
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <button className="gradient-btn w-full rounded-xl px-4 py-3 font-semibold text-white">Update Password</button>
        <Link to="/login" className="text-sm text-teal-200">Back to login</Link>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
