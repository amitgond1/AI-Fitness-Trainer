import { useEffect, useState } from "react";
import MotionPage from "../components/MotionPage";
import Loader from "../components/Loader";
import { leaderboardApi } from "../services/api";

const LeaderboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    leaderboardApi
      .getLeaderboard()
      .then((res) => setRows(res.data.leaderboard || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading leaderboard..." />;

  return (
    <MotionPage>
      <h1 className="section-title">Leaderboard</h1>
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-700">
        <table className="min-w-full divide-y divide-slate-700 bg-slate-900/60 text-sm">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left">Rank</th>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Calories</th>
              <th className="px-4 py-3 text-left">Workouts</th>
              <th className="px-4 py-3 text-left">Streak</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {rows.map((row) => (
              <tr key={row.userId}>
                <td className="px-4 py-3">#{row.rank}</td>
                <td className="px-4 py-3">{row.name}</td>
                <td className="px-4 py-3">{Math.round(row.totalCalories)} kcal</td>
                <td className="px-4 py-3">{row.workoutCount}</td>
                <td className="px-4 py-3">{row.streak} days</td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">No leaderboard data yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </MotionPage>
  );
};

export default LeaderboardPage;
