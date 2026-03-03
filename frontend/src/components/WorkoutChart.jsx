import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const WorkoutChart = ({ data }) => (
  <div className="glass-card rounded-2xl p-4">
    <h3 className="mb-4 text-lg font-semibold">Weekly Activity</h3>
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="day" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} />
          <Legend />
          <Line type="monotone" dataKey="calories" stroke="#06b6d4" strokeWidth={2} />
          <Line type="monotone" dataKey="duration" stroke="#4f46e5" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default WorkoutChart;
