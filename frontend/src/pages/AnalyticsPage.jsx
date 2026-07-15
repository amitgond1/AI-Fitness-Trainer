import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FaBurn, FaCalendarCheck, FaClock, FaDumbbell, FaPrint, FaRoad, FaRunning } from "react-icons/fa";
import MotionPage from "../components/MotionPage";
import Loader from "../components/Loader";
import { workoutApi } from "../services/api";

const currentMonth = () => new Date().toISOString().slice(0, 7);
const activityColors = { gym: "bg-orange-400", running: "bg-teal-400", walking: "bg-sky-400", cycling: "bg-indigo-400", yoga: "bg-purple-400", sports: "bg-rose-400", other: "bg-slate-400" };

const Metric = ({ icon, label, value, note }) => (
  <article className="glass-card rounded-2xl p-4">
    <div className="flex items-start justify-between gap-2"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 text-2xl font-bold sm:text-3xl">{value}</p></div><span className="rounded-xl bg-gradient-to-br from-orange-400/25 to-teal-400/25 p-3 text-orange-200">{icon}</span></div>
    {note && <p className="mt-2 text-xs text-slate-400">{note}</p>}
  </article>
);

const AnalyticsPage = () => {
  const [month, setMonth] = useState(currentMonth());
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    workoutApi.getMonthlyReport(month).then((res) => setReport(res.data)).catch((err) => setError(err?.response?.data?.message || "Report load nahi hui.")).finally(() => setLoading(false));
  }, [month]);

  const insights = useMemo(() => {
    if (!report) return [];
    const { summary } = report;
    const messages = [];
    if (summary.totalMinutes >= 600) messages.push(`Strong month: ${(summary.totalMinutes / 60).toFixed(1)} active hours complete.`);
    else messages.push("Consistency tip: chhote 20–30 minute sessions bhi monthly total ko strong banate hain.");
    if (summary.distanceKm > 0) messages.push(`You covered ${summary.distanceKm} km. Next month ka realistic goal 5–10% higher rakh sakte ho.`);
    if ((report.byMuscle || []).length < 4 && summary.gymHours > 0) messages.push("Balanced strength ke liye major muscle groups ko weekly plan mein cover karo.");
    if (!summary.activities) messages.push("First activity log karo; report automatically build hona shuru ho jayegi.");
    return messages;
  }, [report]);

  if (loading) return <Loader text="Monthly report preparing..." />;
  if (error) return <div className="glass-card rounded-2xl p-6 text-rose-300">{error}</div>;

  const summary = report?.summary || {};
  const totalTypeMinutes = (report?.byType || []).reduce((sum, row) => sum + row.minutes, 0) || 1;

  return (
    <MotionPage>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-300">Progress, not perfection</p><h1 className="section-title mt-1">Monthly fitness report</h1><p className="mt-1 text-sm text-slate-300">Gym hours, running distance, activity balance aur consistency.</p></div>
        <div className="no-print flex gap-2"><input aria-label="Report month" type="month" max={currentMonth()} value={month} onChange={(e) => setMonth(e.target.value)} className="input-control" /><button type="button" onClick={() => window.print()} className="flex items-center gap-2 rounded-xl border border-white/15 bg-slate-900/60 px-4 py-2 text-sm font-semibold"><FaPrint /> <span className="hidden sm:inline">Save PDF</span></button></div>
      </div>

      <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric icon={<FaDumbbell />} label="Gym time" value={`${summary.gymHours || 0}h`} note={`${summary.totalSets || 0} total sets`} />
        <Metric icon={<FaRunning />} label="Running time" value={`${summary.runningHours || 0}h`} note={`${summary.distanceKm || 0} km total distance`} />
        <Metric icon={<FaClock />} label="All activity" value={`${summary.totalMinutes || 0}m`} note={`${summary.activities || 0} sessions`} />
        <Metric icon={<FaCalendarCheck />} label="Active days" value={summary.activeDays || 0} note={`${summary.consistencyPercent || 0}% month consistency`} />
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="glass-card rounded-xl p-3 text-center"><FaRoad className="mx-auto text-sky-300" /><p className="mt-1 text-lg font-bold">{summary.distanceKm || 0} km</p><p className="text-xs text-slate-400">Distance</p></div>
        <div className="glass-card rounded-xl p-3 text-center"><FaBurn className="mx-auto text-orange-300" /><p className="mt-1 text-lg font-bold">{summary.calories || 0}</p><p className="text-xs text-slate-400">Calories</p></div>
        <div className="glass-card rounded-xl p-3 text-center"><FaDumbbell className="mx-auto text-teal-300" /><p className="mt-1 text-lg font-bold">{summary.totalReps || 0}</p><p className="text-xs text-slate-400">Reps</p></div>
        <div className="glass-card rounded-xl p-3 text-center"><FaCalendarCheck className="mx-auto text-purple-300" /><p className="mt-1 text-lg font-bold">{summary.activities || 0}</p><p className="text-xs text-slate-400">Sessions</p></div>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <article className="glass-card rounded-2xl p-3 sm:p-5"><h2 className="font-bold">Daily movement</h2><p className="text-xs text-slate-400">Minutes and distance across the month</p><div className="mt-4 h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={report?.daily || []} margin={{ left: -22, right: 4 }}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="_id" tickFormatter={(value) => value.slice(-2)} stroke="#94a3b8" fontSize={11} /><YAxis stroke="#94a3b8" fontSize={11} /><Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 12 }} /><Bar dataKey="minutes" name="Minutes" fill="#f97316" radius={[5, 5, 0, 0]} /><Bar dataKey="distanceKm" name="Distance km" fill="#14b8a6" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div></article>
        <article className="glass-card rounded-2xl p-5"><h2 className="font-bold">Activity balance</h2><div className="mt-5 space-y-4">{(report?.byType || []).length ? report.byType.map((row) => { const percent = Math.round((row.minutes / totalTypeMinutes) * 100); return <div key={row._id}><div className="flex justify-between text-sm"><span className="capitalize">{row._id}</span><span className="text-slate-300">{row.minutes} min · {row.distanceKm.toFixed(1)} km</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800"><div className={`h-full rounded-full ${activityColors[row._id] || activityColors.other}`} style={{ width: `${percent}%` }} /></div></div>; }) : <p className="text-sm text-slate-400">No activity logged for this month.</p>}</div></article>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-2">
        <article className="glass-card rounded-2xl p-5"><h2 className="font-bold">Muscle-group coverage</h2><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">{(report?.byMuscle || []).map((row) => <div key={row._id} className="rounded-xl border border-white/10 bg-slate-950/40 p-3"><p className="text-sm font-semibold">{row._id}</p><p className="mt-1 text-xs text-slate-400">{row.sessions} sessions · {row.sets} sets</p></div>)}{!report?.byMuscle?.length && <p className="col-span-full text-sm text-slate-400">Gym sessions log karne par coverage yahan dikhegi.</p>}</div></article>
        <article className="glass-card rounded-2xl p-5"><h2 className="font-bold">Coach insights</h2><div className="mt-4 space-y-3">{insights.map((text, index) => <p key={text} className="rounded-xl border border-teal-400/15 bg-teal-400/10 p-3 text-sm text-slate-200"><span className="mr-2 font-bold text-teal-300">{index + 1}.</span>{text}</p>)}</div></article>
      </section>
    </MotionPage>
  );
};

export default AnalyticsPage;
