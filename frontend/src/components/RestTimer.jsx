import useCountdown from "../hooks/useCountdown";

const RestTimer = () => {
  const { seconds, isRunning, setIsRunning, reset } = useCountdown(30, false);

  const display = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div className="glass-card rounded-2xl p-4">
      <h4 className="text-lg font-semibold">Rest Timer</h4>
      <p className="mt-2 text-4xl font-bold text-indigo-300">{display}</p>
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={() => setIsRunning((prev) => !prev)} className="rounded-lg bg-indigo-500 px-4 py-2 text-sm text-white">
          {isRunning ? "Pause" : "Start Rest"}
        </button>
        <button type="button" onClick={() => reset(30)} className="rounded-lg border border-slate-600 px-4 py-2 text-sm">
          Reset
        </button>
      </div>
    </div>
  );
};

export default RestTimer;
