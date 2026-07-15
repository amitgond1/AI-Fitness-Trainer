import { useEffect, useMemo, useState } from "react";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FaChartLine, FaFire, FaMedal, FaRunning, FaRuler, FaTrash, FaTrophy, FaWeight } from "react-icons/fa";
import MotionPage from "../components/MotionPage";
import Loader from "../components/Loader";
import { progressApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const emptyForm = (weight = "") => ({ date: today(), weightKg: weight, waistCm: "", chestCm: "", armsCm: "", bodyFatPercent: "", energy: 5, mood: "Good", notes: "" });

const RecordCard = ({ icon, label, value, detail, tone = "orange" }) => (
  <article className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/75 p-5 shadow-xl">
    <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl ${tone === "teal" ? "bg-teal-400/20" : "bg-orange-400/20"}`} />
    <span className={`inline-flex rounded-2xl p-3 text-xl ${tone === "teal" ? "bg-teal-400/15 text-teal-300" : "bg-orange-400/15 text-orange-300"}`}>{icon}</span>
    <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
    <p className="mt-1 text-2xl font-black text-white">{value}</p>
    <p className="mt-1 truncate text-xs text-slate-400">{detail || "Record an activity to unlock"}</p>
  </article>
);

const ProgressPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [metrics, setMetrics] = useState([]);
  const [overview, setOverview] = useState(null);
  const [form, setForm] = useState(() => emptyForm(user?.weight || ""));
  const [toast, setToast] = useState(null);
  const [chartMetric, setChartMetric] = useState("weightKg");

  const notify = (text, type = "success") => setToast({ text, type });
  const load = async () => {
    const [metricsRes, overviewRes] = await Promise.all([progressApi.getMetrics(180), progressApi.getOverview()]);
    setMetrics(metricsRes.data.metrics || []);
    setOverview(overviewRes.data);
  };

  useEffect(() => {
    load().catch(() => notify("Progress data load nahi hua.", "error")).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const chartData = useMemo(() => [...metrics].reverse().filter((item) => item[chartMetric] != null).map((item) => ({ date: new Date(item.date).toLocaleDateString(undefined, { day: "2-digit", month: "short" }), value: item[chartMetric] })), [metrics, chartMetric]);

  const saveMetric = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value === "" ? undefined : value]));
      const { data } = await progressApi.createMetric(payload);
      setMetrics((items) => [data, ...items]);
      setForm(emptyForm(data.weightKg || form.weightKg));
      const overviewRes = await progressApi.getOverview();
      setOverview(overviewRes.data);
      notify("Body progress entry save ho gayi!");
    } catch (error) {
      notify(error?.response?.data?.message || "Measurement save nahi hua.", "error");
    } finally {
      setSaving(false);
    }
  };

  const removeMetric = async (id) => {
    try {
      await progressApi.deleteMetric(id);
      setMetrics((items) => items.filter((item) => item._id !== id));
      const overviewRes = await progressApi.getOverview();
      setOverview(overviewRes.data);
      notify("Measurement delete ho gaya.");
    } catch (error) {
      notify(error?.response?.data?.message || "Delete nahi hua.", "error");
    }
  };

  if (loading) return <Loader text="Building your progress story..." />;
  const records = overview?.records || {};
  const pace = records.fastestRun?.pace;

  return (
    <MotionPage>
      {toast && <div className={`fixed right-3 top-20 z-[80] w-[calc(100%-1.5rem)] max-w-sm rounded-2xl border p-4 shadow-2xl backdrop-blur-xl sm:right-6 ${toast.type === "error" ? "border-rose-400/30 bg-rose-950/95 text-rose-100" : "border-emerald-400/30 bg-emerald-950/95 text-emerald-100"}`} role="status"><div className="flex justify-between gap-3"><div><p className="font-black">{toast.type === "error" ? "Could not save" : "Progress updated"}</p><p className="mt-1 text-sm opacity-90">{toast.text}</p></div><button onClick={() => setToast(null)} aria-label="Close">×</button></div></div>}

      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950 via-slate-900 to-teal-950 p-6 shadow-2xl sm:p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="relative"><p className="text-xs font-bold uppercase tracking-[0.25em] text-teal-300">Your transformation</p><h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">See how far you've come.</h1><p className="mt-2 max-w-2xl text-sm text-slate-300">Measurements, strength records aur running personal bests ek clear progress story mein.</p></div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <RecordCard icon={<FaRunning />} label="Longest run" value={records.longestRun ? `${records.longestRun.distanceKm.toFixed(1)} km` : "--"} detail={records.longestRun?.exercise} tone="teal" />
        <RecordCard icon={<FaFire />} label="Fastest pace" value={pace ? `${Math.floor(pace)}:${String(Math.round((pace % 1) * 60)).padStart(2, "0")} /km` : "--"} detail={records.fastestRun ? `${records.fastestRun.distanceKm.toFixed(1)} km run` : null} tone="teal" />
        <RecordCard icon={<FaTrophy />} label="Heaviest lift" value={records.heaviestLift?.weightLiftedKg ? `${records.heaviestLift.weightLiftedKg} kg` : "--"} detail={records.heaviestLift?.exercise} />
        <RecordCard icon={<FaMedal />} label="Biggest session" value={records.biggestSession?.totalVolumeKg ? `${Math.round(records.biggestSession.totalVolumeKg).toLocaleString()} kg` : "--"} detail={records.biggestSession?.exercise} />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.4fr]">
        <form onSubmit={saveMetric} className="glass-card rounded-3xl p-5 sm:p-6">
          <div className="flex items-center gap-3"><span className="rounded-2xl bg-orange-400/15 p-3 text-orange-300"><FaRuler /></span><div><h2 className="text-xl font-black">Add measurement</h2><p className="text-xs text-slate-400">Blank fields ko skip kar sakte ho.</p></div></div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <label className="field-label col-span-2">Date<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-control" required /></label>
            <label className="field-label">Weight (kg)<input type="number" min="20" max="500" step="0.1" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: e.target.value })} className="input-control" /></label>
            <label className="field-label">Waist (cm)<input type="number" min="20" max="300" step="0.1" value={form.waistCm} onChange={(e) => setForm({ ...form, waistCm: e.target.value })} className="input-control" /></label>
            <label className="field-label">Chest (cm)<input type="number" min="20" max="300" step="0.1" value={form.chestCm} onChange={(e) => setForm({ ...form, chestCm: e.target.value })} className="input-control" /></label>
            <label className="field-label">Arms (cm)<input type="number" min="10" max="150" step="0.1" value={form.armsCm} onChange={(e) => setForm({ ...form, armsCm: e.target.value })} className="input-control" /></label>
            <label className="field-label">Body fat %<input type="number" min="1" max="75" step="0.1" value={form.bodyFatPercent} onChange={(e) => setForm({ ...form, bodyFatPercent: e.target.value })} className="input-control" /></label>
            <label className="field-label">Mood<select value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value })} className="input-control"><option>Low</option><option>Okay</option><option>Good</option><option>Great</option></select></label>
            <label className="field-label col-span-2">Energy: {form.energy}/10<input type="range" min="1" max="10" value={form.energy} onChange={(e) => setForm({ ...form, energy: e.target.value })} className="mt-3 w-full accent-orange-400" /></label>
            <label className="field-label col-span-2">Notes<textarea rows="2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-control resize-none" placeholder="How are you feeling?" /></label>
          </div>
          <button disabled={saving} className="gradient-btn mt-5 w-full rounded-xl px-5 py-3 font-black text-white disabled:opacity-50">{saving ? "Saving..." : "Save progress"}</button>
        </form>

        <article className="glass-card rounded-3xl p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="flex items-center gap-2 text-xl font-black"><FaChartLine className="text-teal-300" /> Body trend</h2><p className="text-xs text-slate-400">Consistency se real change visible hota hai.</p></div><select value={chartMetric} onChange={(e) => setChartMetric(e.target.value)} className="input-control w-full sm:w-44"><option value="weightKg">Weight</option><option value="waistCm">Waist</option><option value="chestCm">Chest</option><option value="armsCm">Arms</option><option value="bodyFatPercent">Body fat</option></select></div>
          <div className="mt-5 h-72 sm:h-80">{chartData.length ? <ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ left: -20, right: 12 }}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="date" stroke="#94a3b8" fontSize={11} /><YAxis stroke="#94a3b8" fontSize={11} domain={["dataMin - 2", "dataMax + 2"]} /><Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 12 }} /><Line type="monotone" dataKey="value" stroke="#2dd4bf" strokeWidth={3} dot={{ fill: "#f97316", strokeWidth: 0, r: 4 }} /></LineChart></ResponsiveContainer> : <div className="flex h-full flex-col items-center justify-center text-center"><FaChartLine className="text-5xl text-slate-700" /><p className="mt-3 font-bold">Add measurements to see your trend</p><p className="text-xs text-slate-500">Two or more entries make comparison useful.</p></div>}</div>
        </article>
      </section>

      <section className="mt-5"><h2 className="mb-3 text-xl font-black">Measurement history</h2><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{metrics.map((item) => <article key={item._id} className="rounded-2xl border border-white/10 bg-slate-900/65 p-4"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{new Date(item.date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</p><p className="mt-1 text-xl font-black">{item.weightKg ? `${item.weightKg} kg` : "Body check-in"}</p></div><button onClick={() => removeMetric(item._id)} className="rounded-xl p-2 text-slate-500 hover:bg-rose-500/10 hover:text-rose-300" aria-label="Delete measurement"><FaTrash /></button></div><div className="mt-3 flex flex-wrap gap-2 text-xs">{item.waistCm && <span className="rounded-full bg-white/5 px-2 py-1">Waist {item.waistCm}cm</span>}{item.chestCm && <span className="rounded-full bg-white/5 px-2 py-1">Chest {item.chestCm}cm</span>}{item.armsCm && <span className="rounded-full bg-white/5 px-2 py-1">Arms {item.armsCm}cm</span>}{item.bodyFatPercent && <span className="rounded-full bg-white/5 px-2 py-1">Fat {item.bodyFatPercent}%</span>}<span className="rounded-full bg-teal-400/10 px-2 py-1 text-teal-200">{item.mood} · {item.energy}/10</span></div></article>)}{!metrics.length && <div className="col-span-full rounded-3xl border border-dashed border-white/15 p-8 text-center text-slate-400"><FaWeight className="mx-auto text-4xl" /><p className="mt-2">No measurements yet.</p></div>}</div></section>
    </MotionPage>
  );
};

export default ProgressPage;
