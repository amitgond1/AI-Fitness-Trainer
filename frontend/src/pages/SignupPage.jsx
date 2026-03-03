import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SignupPage = () => {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    age: 25,
    height: 170,
    weight: 70,
    goal: "Beginner"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signup({ ...form, age: Number(form.age), height: Number(form.height), weight: Number(form.weight) });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Cannot connect to server. Check backend and API URL.");
    }
  };

  return (
    <div className="auth-bg flex min-h-[100dvh] items-start justify-center px-4 py-6 sm:items-center sm:py-8">
      <form onSubmit={handleSubmit} className="glass-card reveal-up w-full max-w-xl space-y-4 rounded-3xl p-5 sm:p-6">
        <h1 className="text-2xl font-bold">Create Your Account</h1>
        <div className="grid gap-3 md:grid-cols-2">
          <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} className="rounded-xl border border-white/20 bg-slate-900/55 px-4 py-3 text-sm sm:text-base" required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="rounded-xl border border-white/20 bg-slate-900/55 px-4 py-3 text-sm sm:text-base" required />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="rounded-xl border border-white/20 bg-slate-900/55 px-4 py-3 text-sm sm:text-base" required />
          <input name="age" type="number" placeholder="Age" value={form.age} onChange={handleChange} className="rounded-xl border border-white/20 bg-slate-900/55 px-4 py-3 text-sm sm:text-base" required />
          <input name="height" type="number" placeholder="Height (cm)" value={form.height} onChange={handleChange} className="rounded-xl border border-white/20 bg-slate-900/55 px-4 py-3 text-sm sm:text-base" required />
          <input name="weight" type="number" placeholder="Weight (kg)" value={form.weight} onChange={handleChange} className="rounded-xl border border-white/20 bg-slate-900/55 px-4 py-3 text-sm sm:text-base" required />
          <select name="goal" value={form.goal} onChange={handleChange} className="rounded-xl border border-white/20 bg-slate-900/55 px-4 py-3 text-sm sm:text-base md:col-span-2">
            <option>Weight Loss</option>
            <option>Muscle Gain</option>
            <option>Strength</option>
            <option>Beginner</option>
            <option>Advanced</option>
          </select>
        </div>

        {error && <p className="text-sm text-rose-300">{error}</p>}
        <button type="submit" className="gradient-btn w-full rounded-xl px-4 py-3 font-semibold text-white" disabled={loading}>
          {loading ? "Creating..." : "Signup"}
        </button>

        <p className="text-sm text-slate-300">
          Already registered? <Link to="/login" className="text-teal-200">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default SignupPage;
