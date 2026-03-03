import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "", rememberMe: true });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(form);
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Cannot connect to server. Check backend and API URL.");
    }
  };

  return (
    <div className="auth-bg flex min-h-[100dvh] items-start justify-center px-3 py-6 sm:items-center sm:px-4 sm:py-8">
      <form onSubmit={handleSubmit} className="glass-card reveal-up w-full max-w-md space-y-4 rounded-3xl p-5 sm:p-6">
        <h1 className="text-2xl font-bold">Welcome Back</h1>
        <p className="text-sm text-slate-300">Login to continue your training.</p>

        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full rounded-xl border border-white/20 bg-slate-900/55 px-4 py-3 text-sm sm:text-base" required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="w-full rounded-xl border border-white/20 bg-slate-900/55 px-4 py-3 text-sm sm:text-base" required />

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" name="rememberMe" checked={form.rememberMe} onChange={handleChange} />
          Remember me
        </label>

        {error && <p className="text-sm text-rose-300">{error}</p>}

        <button type="submit" className="gradient-btn w-full rounded-xl px-4 py-3 font-semibold text-white" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="flex justify-between text-sm text-slate-300">
          <Link to="/forgot-password" className="hover:text-orange-200">Forgot Password?</Link>
          <Link to="/signup" className="hover:text-teal-200">Create account</Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
