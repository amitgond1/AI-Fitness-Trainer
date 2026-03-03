import { useEffect, useState } from "react";
import MotionPage from "../components/MotionPage";
import { userApi } from "../services/api";

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ name: "", age: 25, height: 170, weight: 70, goal: "Beginner", fitnessLevel: "Beginner" });

  useEffect(() => {
    userApi
      .getProfile()
      .then((res) => {
        setForm({
          name: res.data.name || "",
          age: res.data.age || 25,
          height: res.data.height || 170,
          weight: res.data.weight || 70,
          goal: res.data.goal || "Beginner",
          fitnessLevel: res.data.fitnessLevel || "Beginner"
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await userApi.updateProfile({
        ...form,
        age: Number(form.age),
        height: Number(form.height),
        weight: Number(form.weight)
      });
      setMessage("Profile updated.");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to update profile.");
    }
  };

  if (loading) {
    return (
      <MotionPage>
        <div className="glass-card rounded-2xl p-6">Loading profile...</div>
      </MotionPage>
    );
  }

  return (
    <MotionPage>
      <section className="glass-card mx-auto max-w-2xl rounded-2xl p-6">
        <h1 className="section-title">Profile</h1>
        <form onSubmit={onSubmit} className="mt-6 grid gap-3 sm:grid-cols-2">
          <input name="name" value={form.name} onChange={onChange} className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2" placeholder="Name" />
          <input name="age" type="number" value={form.age} onChange={onChange} className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2" placeholder="Age" />
          <input name="height" type="number" value={form.height} onChange={onChange} className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2" placeholder="Height" />
          <input name="weight" type="number" value={form.weight} onChange={onChange} className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2" placeholder="Weight" />
          <select name="goal" value={form.goal} onChange={onChange} className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2">
            <option>Weight Loss</option>
            <option>Muscle Gain</option>
            <option>Strength</option>
            <option>Beginner</option>
            <option>Advanced</option>
          </select>
          <select name="fitnessLevel" value={form.fitnessLevel} onChange={onChange} className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2">
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
          <button className="gradient-btn rounded-lg px-4 py-2 font-semibold text-white sm:col-span-2">Save Profile</button>
        </form>
        {message && <p className="mt-3 text-sm text-cyan-300">{message}</p>}
      </section>
    </MotionPage>
  );
};

export default ProfilePage;
