import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell
} from "recharts";
import MotionPage from "../components/MotionPage";
import Loader from "../components/Loader";
import { workoutApi } from "../services/api";

const COLORS = ["#4f46e5", "#06b6d4", "#22c55e", "#f97316", "#f43f5e"];

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({ monthly: [], byExercise: [] });

  useEffect(() => {
    workoutApi
      .getAnalytics()
      .then((res) => setAnalytics(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading analytics..." />;

  return (
    <MotionPage>
      <h1 className="section-title">Progress Analytics</h1>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="glass-card rounded-2xl p-4">
          <h3 className="mb-4 text-lg font-semibold">Monthly Workouts</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="_id" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="workouts" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                <Bar dataKey="calories" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <h3 className="mb-4 text-lg font-semibold">Exercise Split</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analytics.byExercise} dataKey="count" nameKey="_id" outerRadius={110} label>
                  {analytics.byExercise.map((entry, index) => (
                    <Cell key={entry._id} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </MotionPage>
  );
};

export default AnalyticsPage;
