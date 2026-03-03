import { useMemo, useRef, useState } from "react";
import MotionPage from "../components/MotionPage";
import PoseTrainer from "../components/PoseTrainer";
import WorkoutTimer from "../components/WorkoutTimer";
import RestTimer from "../components/RestTimer";
import useVoiceGuidance from "../hooks/useVoiceGuidance";
import { workoutApi } from "../services/api";

const calorieRates = {
  Pushups: 8,
  Squats: 5,
  Lunges: 6,
  Plank: 3,
  "Jumping Jacks": 8,
  Running: 9,
  Yoga: 3
};

const WorkoutPage = () => {
  const { supported, speak } = useVoiceGuidance();
  const [latestPose, setLatestPose] = useState(null);
  const [message, setMessage] = useState("");
  const lastWarningRef = useRef({ text: "", at: 0 });
  const [form, setForm] = useState({
    exercise: "Pushups",
    reps: 12,
    duration: 10,
    sets: 3,
    weight: 70
  });

  const calories = useMemo(() => {
    const met = calorieRates[form.exercise] || 5;
    return ((met * 3.5 * Number(form.weight)) / 200) * Number(form.duration);
  }, [form]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRepUpdate = (data) => {
    setLatestPose(data);

    if (typeof data?.reps === "number") {
      setForm((prev) => {
        if (data?.exercise && data.exercise !== prev.exercise) return prev;
        return { ...prev, reps: data.reps };
      });
    }

    const warning = data?.posture?.warnings?.[0];
    if (data?.posture?.status === "warning" && warning && supported) {
      const now = Date.now();
      const isSameWarning = lastWarningRef.current.text === warning;
      const isCooldown = now - lastWarningRef.current.at < 3500;

      if (!isSameWarning || !isCooldown) {
        speak(warning);
        lastWarningRef.current = { text: warning, at: now };
      }
    }
  };

  const handleExerciseChange = (value) => {
    setLatestPose(null);
    setForm((prev) => ({ ...prev, exercise: value, reps: 0 }));
  };

  const logWorkout = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await workoutApi.createWorkout({
        exercise: form.exercise,
        reps: Number(form.reps),
        sets: Number(form.sets),
        duration: Number(form.duration),
        calories: Number(calories.toFixed(2))
      });
      setMessage("Workout saved successfully.");
      if (supported) speak("Great job. Workout saved.");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Could not save workout.");
    }
  };

  return (
    <MotionPage>
      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <PoseTrainer
          onRepUpdate={handleRepUpdate}
          onExerciseChange={handleExerciseChange}
        />

        <div className="space-y-4">
          <WorkoutTimer />
          <RestTimer />
          <div className="glass-card rounded-2xl p-4">
            <h3 className="text-lg font-semibold">Voice Guidance</h3>
            <p className="mt-2 text-sm text-slate-300">{supported ? "Speech synthesis ready." : "Voice guidance not supported in this browser."}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => speak("Start Pushups") } className="rounded-lg bg-indigo-500 px-3 py-2 text-sm text-white">Start Pushups</button>
              <button type="button" onClick={() => speak("Great Job") } className="rounded-lg bg-cyan-500 px-3 py-2 text-sm text-white">Great Job</button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <form onSubmit={logWorkout} className="glass-card rounded-2xl p-4">
          <h3 className="mb-3 text-lg font-semibold">Workout Tracking</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <select name="exercise" value={form.exercise} onChange={onChange} className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2">
              <option>Pushups</option>
              <option>Squats</option>
              <option>Lunges</option>
              <option>Plank</option>
              <option>Jumping Jacks</option>
            </select>
            <input name="reps" type="number" min="0" step="1" value={form.reps} onChange={onChange} placeholder="Reps" className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2" />
            <input name="sets" type="number" value={form.sets} onChange={onChange} placeholder="Sets" className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2" />
            <input name="duration" type="number" value={form.duration} onChange={onChange} placeholder="Duration (min)" className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2" />
            <input name="weight" type="number" value={form.weight} onChange={onChange} placeholder="Weight (kg)" className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2" />
            <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm">Calories: {calories.toFixed(2)} kcal</div>
          </div>
          <button className="gradient-btn mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-white">Save Workout</button>
          {message && <p className="mt-2 text-sm text-cyan-300">{message}</p>}
        </form>

        <div className="glass-card rounded-2xl p-4">
          <h3 className="mb-3 text-lg font-semibold">Posture Correction</h3>
          {latestPose ? (
            <div className="space-y-2 text-sm">
              <p className="text-slate-300">Exercise: {latestPose.exercise}</p>
              <p className="text-slate-300">Counter: {latestPose.reps}</p>
              {(latestPose.posture?.warnings || []).map((w, i) => (
                <p key={`${w}-${i}`} className="rounded-lg bg-rose-500/10 p-2 text-rose-300">
                  {w}
                </p>
              ))}
              {!latestPose.posture?.warnings?.length && (
                <p className="rounded-lg bg-emerald-500/10 p-2 text-emerald-300">Correct posture maintained.</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Start camera to see live posture corrections.</p>
          )}
        </div>
      </section>
    </MotionPage>
  );
};

export default WorkoutPage;
