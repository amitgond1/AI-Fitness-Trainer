import { useEffect, useState } from "react";

const toClock = (seconds) => {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
};

const WorkoutTimer = () => {
  const [seconds, setSeconds] = useState(45);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || seconds <= 0) return undefined;
    const id = setTimeout(() => setSeconds((prev) => prev - 1), 1000);
    return () => clearTimeout(id);
  }, [running, seconds]);

  return (
    <div className="glass-card rounded-2xl p-4">
      <h4 className="text-lg font-semibold">Workout Timer</h4>
      <p className="mt-2 text-4xl font-bold text-cyan-300">{toClock(seconds)}</p>
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={() => setRunning((v) => !v)} className="gradient-btn rounded-lg px-4 py-2 text-sm font-semibold text-white">
          {running ? "Pause" : "Start"}
        </button>
        <button type="button" onClick={() => { setSeconds(45); setRunning(false); }} className="rounded-lg border border-slate-600 px-4 py-2 text-sm">
          Reset
        </button>
      </div>
    </div>
  );
};

export default WorkoutTimer;
