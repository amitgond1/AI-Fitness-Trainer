import { useEffect, useMemo, useState } from "react";
import { FaBolt, FaCalendarAlt, FaCheckCircle, FaClock, FaDumbbell, FaExclamationCircle, FaMapMarkerAlt, FaRunning, FaTrash } from "react-icons/fa";
import MotionPage from "../components/MotionPage";
import Loader from "../components/Loader";
import { workoutApi } from "../services/api";

const activityOptions = [
  { value: "gym", label: "Gym", icon: <FaDumbbell /> },
  { value: "running", label: "Running", icon: <FaRunning /> },
  { value: "walking", label: "Walking", icon: <FaMapMarkerAlt /> },
  { value: "cycling", label: "Cycling", icon: <FaMapMarkerAlt /> },
  { value: "yoga", label: "Yoga", icon: <FaClock /> },
  { value: "sports", label: "Sports", icon: <FaRunning /> }
];

const muscleGroups = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core", "Full Body", "Cardio", "Mobility", "Other"];
const localDate = () => {
  const date = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
  return date.toISOString().slice(0, 10);
};
const toLocalDateKey = (value) => {
  const date = new Date(value);
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 10);
};

const emptyForm = {
  activityType: "gym",
  exercise: "Strength training",
  muscleGroup: "Chest",
  duration: 45,
  distanceKm: 0,
  sets: 3,
  reps: 10,
  setDetails: [
    { reps: 10, weightKg: 20 },
    { reps: 10, weightKg: 20 },
    { reps: 10, weightKg: 20 }
  ],
  intensity: "Moderate",
  perceivedEffort: 5,
  activityDate: localDate(),
  startTime: "06:00",
  endTime: "07:00",
  notes: ""
};

const TrackerPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [plan, setPlan] = useState(null);
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState(null);
  const [activeView, setActiveView] = useState("log");
  const [historyDate, setHistoryDate] = useState("");
  const [historyRange, setHistoryRange] = useState(30);
  const [historyType, setHistoryType] = useState("all");

  const notify = (text, type = "success") => setToast({ text, type });

  const loadData = async () => {
    try {
      const [planRes, historyRes] = await Promise.all([
        workoutApi.getTrainingPlan(),
        workoutApi.getWorkouts({ limit: 365 })
      ]);
      setPlan(planRes.data);
      setHistory(historyRes.data.workouts || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData().catch(() => notify("Tracker data load nahi ho saka.", "error"));
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const thisWeek = useMemo(() => {
    const start = new Date();
    const day = start.getDay() || 7;
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - day + 1);
    return history.filter((item) => new Date(item.date) >= start).reduce(
      (acc, item) => ({
        minutes: acc.minutes + Number(item.duration || 0),
        sessions: acc.sessions + 1
      }),
      { minutes: 0, sessions: 0 }
    );
  }, [history]);

  const todayRun = useMemo(
    () => history
      .filter((item) => item.activityType === "running" && toLocalDateKey(item.date) === localDate())
      .reduce(
        (acc, item) => ({
          minutes: acc.minutes + Number(item.duration || 0),
          distanceKm: acc.distanceKm + Number(item.distanceKm || 0),
          sessions: acc.sessions + 1
        }),
        { minutes: 0, distanceKm: 0, sessions: 0 }
      ),
    [history]
  );

  const runMetrics = useMemo(() => {
    const start = new Date(`${form.activityDate}T${form.startTime}:00`);
    const end = new Date(`${form.activityDate}T${form.endTime}:00`);
    const minutes = Math.max(0, Math.round((end - start) / 60000));
    const distance = Number(form.distanceKm || 0);
    return {
      start,
      end,
      minutes,
      pace: minutes > 0 && distance > 0 ? minutes / distance : 0
    };
  }, [form.activityDate, form.startTime, form.endTime, form.distanceKm]);

  const filteredHistory = useMemo(() => {
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - Number(historyRange));
    return history.filter((item) => {
      if (historyType !== "all" && item.activityType !== historyType) return false;
      if (historyDate) return toLocalDateKey(item.date) === historyDate;
      return historyRange === "all" || new Date(item.date) >= cutoff;
    });
  }, [history, historyDate, historyRange, historyType]);

  const historySummary = useMemo(() => filteredHistory.reduce(
    (acc, item) => ({
      sessions: acc.sessions + 1,
      minutes: acc.minutes + Number(item.duration || 0),
      distanceKm: acc.distanceKm + Number(item.distanceKm || 0)
    }),
    { sessions: 0, minutes: 0, distanceKm: 0 }
  ), [filteredHistory]);

  const chooseActivity = (activityType) => {
    const defaults = {
      gym: { exercise: "Strength training", muscleGroup: "Chest", distanceKm: 0, sets: 3, reps: 10, setDetails: prevSetFallback() },
      running: { exercise: "Morning run", muscleGroup: "Cardio", sets: 0, reps: 0 },
      walking: { exercise: "Walk", muscleGroup: "Cardio", sets: 0, reps: 0 },
      cycling: { exercise: "Cycling", muscleGroup: "Cardio", sets: 0, reps: 0 },
      yoga: { exercise: "Yoga", muscleGroup: "Mobility", sets: 0, reps: 0 },
      sports: { exercise: "Sports session", muscleGroup: "Full Body", sets: 0, reps: 0 }
    };
    function prevSetFallback() {
      return form.setDetails?.length ? form.setDetails : [{ reps: 10, weightKg: 20 }, { reps: 10, weightKg: 20 }, { reps: 10, weightKg: 20 }];
    }
    setForm((prev) => ({ ...prev, activityType, ...defaults[activityType] }));
  };

  const submitActivity = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await workoutApi.createWorkout({
        ...form,
        date: `${form.activityDate}T12:00:00`,
        duration: form.activityType === "running" ? runMetrics.minutes : Number(form.duration),
        startedAt: form.activityType === "running" ? runMetrics.start.toISOString() : undefined,
        endedAt: form.activityType === "running" ? runMetrics.end.toISOString() : undefined,
        distanceKm: Number(form.distanceKm),
        sets: form.activityType === "gym" ? form.setDetails.length : Number(form.sets),
        reps: form.activityType === "gym" ? Number(form.setDetails[0]?.reps || 0) : Number(form.reps),
        setDetails: form.activityType === "gym" ? form.setDetails : [],
        perceivedEffort: Number(form.perceivedEffort)
      });
      setHistory((items) => [data, ...items].slice(0, 365));
      notify(form.activityType === "running" ? "Aaj ki running successfully save ho gayi!" : "Activity successfully save ho gayi!");
      setForm((prev) => ({ ...prev, activityDate: localDate(), notes: "" }));
    } catch (error) {
      notify(error?.response?.data?.message || "Activity save nahi hui.", "error");
    } finally {
      setSaving(false);
    }
  };

  const updatePlanDay = (index, key, value) => {
    setPlan((prev) => ({
      ...prev,
      days: prev.days.map((day, i) => (i === index ? { ...day, [key]: value } : day))
    }));
  };

  const savePlan = async () => {
    setSaving(true);
    try {
      const payload = {
        dailyRunGoalKm: Number(plan.dailyRunGoalKm),
        weeklyActivityGoalMinutes: Number(plan.weeklyActivityGoalMinutes),
        days: plan.days.map((day) => ({
          ...day,
          targetMinutes: Number(day.targetMinutes),
          exercises: Array.isArray(day.exercises) ? day.exercises : String(day.exercises).split(",").map((x) => x.trim()).filter(Boolean)
        }))
      };
      const { data } = await workoutApi.saveTrainingPlan(payload);
      setPlan(data);
      notify("Weekly plan update ho gaya.");
    } catch (error) {
      notify(error?.response?.data?.message || "Plan save nahi hua.", "error");
    } finally {
      setSaving(false);
    }
  };

  const removeActivity = async (id) => {
    try {
      await workoutApi.deleteWorkout(id);
      setHistory((items) => items.filter((item) => item._id !== id));
      notify("Activity delete ho gayi.");
    } catch (error) {
      notify(error?.response?.data?.message || "Delete nahi hua.", "error");
    }
  };

  if (loading) return <Loader text="Your activity hub loading..." />;

  const minuteProgress = Math.min(100, Math.round((thisWeek.minutes / Math.max(plan?.weeklyActivityGoalMinutes || 150, 1)) * 100));
  const runProgress = Math.min(100, Math.round((todayRun.distanceKm / Math.max(plan?.dailyRunGoalKm || 5, 1)) * 100));

  return (
    <MotionPage>
      {toast && <div className={`fixed right-3 top-20 z-[80] flex w-[calc(100%-1.5rem)] max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl sm:right-6 ${toast.type === "error" ? "border-rose-400/30 bg-rose-950/95 text-rose-100" : "border-emerald-400/30 bg-emerald-950/95 text-emerald-100"}`} role="status" aria-live="polite"><span className="mt-0.5 text-xl">{toast.type === "error" ? <FaExclamationCircle /> : <FaCheckCircle />}</span><div className="flex-1"><p className="font-bold">{toast.type === "error" ? "Something went wrong" : "Saved successfully"}</p><p className="mt-1 text-sm opacity-90">{toast.text}</p></div><button type="button" onClick={() => setToast(null)} className="text-xl opacity-70" aria-label="Close notification">×</button></div>}

      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/95 to-teal-950 p-5 shadow-2xl sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-teal-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-52 w-52 rounded-full bg-orange-400/15 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-300">Your fitness journal</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Small steps. Visible progress.</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">Daily running, gym sessions aur purani activity history ko easily track karo.</p>
          </div>
          <div className="grid grid-cols-3 gap-1 rounded-2xl border border-white/10 bg-slate-950/70 p-1.5 shadow-inner">
          {[['log', 'Quick log'], ['plan', 'My split'], ['history', 'History']].map(([value, label]) => (
            <button key={value} type="button" onClick={() => setActiveView(value)} className={`rounded-xl px-3 py-2.5 text-xs font-bold transition sm:px-4 sm:text-sm ${activeView === value ? "bg-gradient-to-r from-orange-500 to-teal-500 text-white shadow-lg" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>{label}</button>
          ))}
          </div>
        </div>
      </div>

      <section className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="overflow-hidden rounded-3xl border border-orange-300/20 bg-gradient-to-br from-orange-500/20 via-slate-900/80 to-slate-950 p-5 shadow-xl">
          <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wider text-orange-200">Today's run</p><FaRunning className="text-2xl text-orange-300" /></div>
          <p className="mt-3 text-3xl font-black">{todayRun.distanceKm.toFixed(1)} <span className="text-base font-medium text-slate-300">km</span></p>
          <p className="mt-1 text-xs text-slate-400">{todayRun.minutes} minutes · {todayRun.sessions} run logged</p>
        </div>
        <div className="glass-card rounded-3xl p-5"><div className="flex justify-between text-xs"><span className="text-slate-400">Daily running goal</span><span className="font-bold text-teal-300">{runProgress}%</span></div><p className="mt-2 text-2xl font-black">{todayRun.distanceKm.toFixed(1)} / {plan?.dailyRunGoalKm || 5} km</p><div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-400" style={{ width: `${runProgress}%` }} /></div></div>
        <div className="glass-card rounded-3xl p-5"><div className="flex justify-between text-xs"><span className="text-slate-400">Weekly active minutes</span><span className="font-bold text-orange-300">{minuteProgress}%</span></div><p className="mt-2 text-2xl font-black">{thisWeek.minutes} / {plan?.weeklyActivityGoalMinutes || 150}</p><p className="mt-1 text-xs text-slate-400">{thisWeek.sessions} total sessions</p><div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-rose-400" style={{ width: `${minuteProgress}%` }} /></div></div>
      </section>

      {activeView === "log" && (
        <form onSubmit={submitActivity} className="glass-card mt-5 rounded-3xl p-4 sm:p-6">
          <h2 className="text-lg font-bold">What did you do?</h2>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {activityOptions.map((item) => <button type="button" key={item.value} onClick={() => chooseActivity(item.value)} className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl border p-2 text-xs font-semibold transition ${form.activityType === item.value ? "border-orange-300 bg-orange-400/20 text-orange-100" : "border-white/10 bg-slate-900/45 text-slate-300 hover:border-teal-400/40"}`}><span className="text-lg">{item.icon}</span>{item.label}</button>)}
          </div>
          <div className="mt-5 space-y-5">
            <label className="field-label">Activity / exercise<input required value={form.exercise} onChange={(e) => setForm({ ...form, exercise: e.target.value })} className="input-control text-base" placeholder="e.g. Bench press or Morning run" /></label>

            {form.activityType === "running" ? (
              <div className="rounded-3xl border border-teal-400/20 bg-gradient-to-br from-teal-400/10 to-slate-950/40 p-4 sm:p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="flex items-center gap-2 font-bold text-teal-100"><FaRunning /> Morning run details</h3><p className="mt-1 text-xs text-slate-400">Start aur finish time se duration automatically niklega.</p></div><button type="button" onClick={() => setForm({ ...form, startTime: "06:00", endTime: "07:30", distanceKm: 5 })} className="rounded-xl border border-teal-300/20 bg-teal-400/10 px-3 py-2 text-xs font-bold text-teal-200"><FaBolt className="mr-1 inline" /> 6:00–7:30 · 5 km</button></div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <label className="field-label">Run date<input required type="date" value={form.activityDate} onChange={(e) => setForm({ ...form, activityDate: e.target.value })} className="input-control" /></label>
                  <label className="field-label">Started at<input required type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="input-control" /></label>
                  <label className="field-label">Finished at<input required type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="input-control" /></label>
                  <label className="field-label">Distance (km)<input required min="0.01" step="0.01" type="number" value={form.distanceKm} onChange={(e) => setForm({ ...form, distanceKm: e.target.value })} className="input-control" /></label>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl bg-slate-950/60 p-3 text-center"><p className="text-xl font-black text-white">{runMetrics.minutes}</p><p className="text-[10px] uppercase tracking-wide text-slate-400">minutes</p></div>
                  <div className="rounded-2xl bg-slate-950/60 p-3 text-center"><p className="text-xl font-black text-white">{runMetrics.pace ? `${Math.floor(runMetrics.pace)}:${String(Math.round((runMetrics.pace % 1) * 60)).padStart(2, "0")}` : "--"}</p><p className="text-[10px] uppercase tracking-wide text-slate-400">pace / km</p></div>
                  <div className="rounded-2xl bg-slate-950/60 p-3 text-center"><p className="text-xl font-black text-white">{form.distanceKm || 0}</p><p className="text-[10px] uppercase tracking-wide text-slate-400">kilometres</p></div>
                </div>
                {runMetrics.minutes <= 0 && <p className="mt-3 text-sm font-semibold text-rose-300">Finish time start time ke baad hona chahiye.</p>}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <label className="field-label">Activity date<input required type="date" value={form.activityDate} onChange={(e) => setForm({ ...form, activityDate: e.target.value })} className="input-control" /></label>
                <label className="field-label">Duration (minutes)<input required min="1" max="1440" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="input-control" /></label>
                <label className="field-label">Muscle group<select value={form.muscleGroup} onChange={(e) => setForm({ ...form, muscleGroup: e.target.value })} className="input-control">{muscleGroups.map((group) => <option key={group}>{group}</option>)}</select></label>
                {form.activityType !== "gym" && <label className="field-label">Distance (km)<input min="0" step="0.01" type="number" value={form.distanceKm} onChange={(e) => setForm({ ...form, distanceKm: e.target.value })} className="input-control" /></label>}
              </div>
            )}

            {form.activityType === "gym" && <div className="rounded-3xl border border-orange-400/20 bg-orange-400/5 p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><div><h3 className="font-black text-orange-100">Set-by-set weight</h3><p className="text-xs text-slate-400">Har set ke reps aur lifted weight enter karo.</p></div><button type="button" onClick={() => setForm({ ...form, setDetails: [...form.setDetails, { reps: 10, weightKg: form.setDetails.at(-1)?.weightKg || 20 }] })} className="rounded-xl bg-orange-400/15 px-3 py-2 text-xs font-bold text-orange-200">+ Add set</button></div><div className="mt-4 space-y-2">{form.setDetails.map((set, index) => <div key={index} className="grid grid-cols-[auto_1fr_1fr_auto] items-end gap-2 rounded-2xl bg-slate-950/45 p-3"><span className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-orange-400/15 text-xs font-black text-orange-200">{index + 1}</span><label className="field-label">Reps<input type="number" min="0" max="1000" value={set.reps} onChange={(e) => setForm({ ...form, setDetails: form.setDetails.map((item, i) => i === index ? { ...item, reps: Number(e.target.value) } : item) })} className="input-control" /></label><label className="field-label">Weight kg<input type="number" min="0" max="2000" step="0.5" value={set.weightKg} onChange={(e) => setForm({ ...form, setDetails: form.setDetails.map((item, i) => i === index ? { ...item, weightKg: Number(e.target.value) } : item) })} className="input-control" /></label><button type="button" disabled={form.setDetails.length === 1} onClick={() => setForm({ ...form, setDetails: form.setDetails.filter((_, i) => i !== index) })} className="mb-2 rounded-lg p-2 text-slate-500 hover:text-rose-300 disabled:opacity-20"><FaTrash /></button></div>)}</div><div className="mt-3 flex flex-wrap justify-between gap-2 rounded-2xl bg-slate-950/60 p-3 text-sm"><span className="text-slate-400">{form.setDetails.length} sets</span><span className="font-black text-orange-200">Total volume: {Math.round(form.setDetails.reduce((sum, set) => sum + Number(set.reps || 0) * Number(set.weightKg || 0), 0)).toLocaleString()} kg</span></div></div>}

            <div className="grid gap-4 sm:grid-cols-2"><label className="field-label">Intensity<select value={form.intensity} onChange={(e) => setForm({ ...form, intensity: e.target.value })} className="input-control"><option>Light</option><option>Moderate</option><option>Hard</option></select></label><label className="field-label">How hard was it? {form.perceivedEffort}/10<input type="range" min="1" max="10" value={form.perceivedEffort} onChange={(e) => setForm({ ...form, perceivedEffort: e.target.value })} className="mt-4 w-full accent-orange-400" /></label></div>
            <label className="field-label">Notes<textarea rows="2" maxLength="500" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-control resize-none" placeholder="Energy, route, personal best, ya workout notes..." /></label>
          </div>
          <button disabled={saving || (form.activityType === "running" && runMetrics.minutes <= 0)} className="gradient-btn mt-5 w-full rounded-xl px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">{saving ? "Saving..." : form.activityType === "running" ? "Save today's run" : "Save activity"}</button>
        </form>
      )}

      {activeView === "plan" && plan && (
        <section className="mt-5 space-y-4">
          <div className="glass-card grid gap-4 rounded-2xl p-4 sm:grid-cols-2">
            <label className="field-label">Weekly active-minute goal<input type="number" min="0" value={plan.weeklyActivityGoalMinutes} onChange={(e) => setPlan({ ...plan, weeklyActivityGoalMinutes: e.target.value })} className="input-control" /></label>
            <label className="field-label">Daily running goal (km)<input type="number" min="0" max="100" step="0.5" value={plan.dailyRunGoalKm ?? 5} onChange={(e) => setPlan({ ...plan, dailyRunGoalKm: e.target.value })} className="input-control" /></label>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {plan.days.map((day, index) => <article key={day.day} className={`glass-card rounded-2xl p-4 ${day.isRestDay ? "border-teal-400/30" : ""}`}><div className="flex items-center justify-between"><h3 className="font-bold text-orange-200">{day.day}</h3><label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={day.isRestDay} onChange={(e) => updatePlanDay(index, "isRestDay", e.target.checked)} /> Rest</label></div><input aria-label={`${day.day} focus`} value={day.focus} onChange={(e) => updatePlanDay(index, "focus", e.target.value)} className="input-control mt-3 font-semibold" /><textarea aria-label={`${day.day} exercises`} rows="2" value={Array.isArray(day.exercises) ? day.exercises.join(", ") : day.exercises || ""} onChange={(e) => updatePlanDay(index, "exercises", e.target.value)} className="input-control mt-3 resize-none" placeholder="Exercises, comma separated" /><label className="mt-3 flex items-center gap-2 text-xs text-slate-300">Target <input type="number" min="0" max="300" value={day.targetMinutes} onChange={(e) => updatePlanDay(index, "targetMinutes", e.target.value)} className="w-20 rounded-lg border border-white/10 bg-slate-950/60 px-2 py-1" /> min</label></article>)}
          </div>
          <button type="button" disabled={saving} onClick={savePlan} className="gradient-btn w-full rounded-xl px-5 py-3 font-bold text-white sm:w-auto">{saving ? "Saving..." : "Save weekly plan"}</button>
        </section>
      )}

      {activeView === "history" && (
        <section className="mt-5 space-y-4">
          <div className="glass-card rounded-3xl p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div><h2 className="flex items-center gap-2 text-xl font-black"><FaCalendarAlt className="text-teal-300" /> Activity history</h2><p className="mt-1 text-xs text-slate-400">Kisi bhi purani date ki running aur workout details dekho.</p></div>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="field-label">Exact date<input type="date" value={historyDate} onChange={(e) => setHistoryDate(e.target.value)} className="input-control min-w-40" /></label>
                <label className="field-label">Activity<select value={historyType} onChange={(e) => setHistoryType(e.target.value)} className="input-control"><option value="all">All activities</option><option value="running">Running</option><option value="gym">Gym</option><option value="walking">Walking</option><option value="cycling">Cycling</option><option value="yoga">Yoga</option></select></label>
                <label className="field-label">Period<select value={historyRange} disabled={Boolean(historyDate)} onChange={(e) => setHistoryRange(e.target.value === "all" ? "all" : Number(e.target.value))} className="input-control disabled:opacity-50"><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option><option value="all">All records</option></select></label>
              </div>
            </div>
            {historyDate && <button type="button" onClick={() => setHistoryDate("")} className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-xs font-bold text-slate-300">Clear selected date</button>}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-center sm:p-4"><p className="text-xl font-black sm:text-2xl">{historySummary.sessions}</p><p className="text-[10px] uppercase tracking-wide text-slate-400 sm:text-xs">Sessions</p></div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-center sm:p-4"><p className="text-xl font-black text-teal-200 sm:text-2xl">{historySummary.distanceKm.toFixed(1)}</p><p className="text-[10px] uppercase tracking-wide text-slate-400 sm:text-xs">Kilometres</p></div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-center sm:p-4"><p className="text-xl font-black text-orange-200 sm:text-2xl">{historySummary.minutes}</p><p className="text-[10px] uppercase tracking-wide text-slate-400 sm:text-xs">Minutes</p></div>
          </div>

          {!filteredHistory.length && <div className="glass-card rounded-3xl p-10 text-center"><FaRunning className="mx-auto text-4xl text-slate-600" /><h3 className="mt-3 font-bold">Is period mein koi activity nahi mili</h3><p className="mt-1 text-sm text-slate-400">Date ya filter change karke dekho.</p></div>}
          <div className="grid gap-3 lg:grid-cols-2">
            {filteredHistory.map((item) => {
              const isRun = item.activityType === "running";
              const pace = isRun && item.distanceKm ? Number(item.duration || 0) / Number(item.distanceKm) : 0;
              return <article key={item._id} className="group rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-950/80 p-4 shadow-lg transition hover:border-teal-400/25 sm:p-5"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className={`rounded-2xl p-3 text-lg ${isRun ? "bg-teal-400/15 text-teal-300" : "bg-orange-400/15 text-orange-300"}`}>{isRun ? <FaRunning /> : <FaDumbbell />}</span><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{new Date(item.date).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</p><h3 className="truncate text-lg font-black text-white">{item.exercise}</h3></div></div><button type="button" onClick={() => removeActivity(item._id)} className="rounded-xl p-3 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-300" aria-label={`Delete ${item.exercise}`}><FaTrash /></button></div><div className="mt-4 grid grid-cols-3 gap-2">{isRun ? <><div className="rounded-xl bg-white/5 p-2 text-center"><p className="font-black text-teal-200">{Number(item.distanceKm || 0).toFixed(1)} km</p><p className="text-[10px] text-slate-500">DISTANCE</p></div><div className="rounded-xl bg-white/5 p-2 text-center"><p className="font-black">{item.duration} min</p><p className="text-[10px] text-slate-500">DURATION</p></div><div className="rounded-xl bg-white/5 p-2 text-center"><p className="font-black">{pace ? `${Math.floor(pace)}:${String(Math.round((pace % 1) * 60)).padStart(2, "0")}` : "--"}</p><p className="text-[10px] text-slate-500">PACE / KM</p></div></> : <><div className="rounded-xl bg-white/5 p-2 text-center"><p className="font-black text-orange-200">{item.duration} min</p><p className="text-[10px] text-slate-500">DURATION</p></div><div className="rounded-xl bg-white/5 p-2 text-center"><p className="font-black">{item.sets || 0}</p><p className="text-[10px] text-slate-500">SETS</p></div><div className="rounded-xl bg-white/5 p-2 text-center"><p className="font-black">{item.reps || 0}</p><p className="text-[10px] text-slate-500">REPS</p></div></>}</div>{item.startedAt && item.endedAt && <p className="mt-3 text-xs text-slate-400">{new Date(item.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {new Date(item.endedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>}{item.notes && <p className="mt-3 rounded-xl bg-white/5 p-3 text-xs text-slate-300">{item.notes}</p>}</article>;
            })}
          </div>
        </section>
      )}
    </MotionPage>
  );
};

export default TrackerPage;
