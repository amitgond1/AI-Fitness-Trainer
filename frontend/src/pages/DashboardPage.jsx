import { useEffect, useMemo, useState } from "react";
import { FaBurn, FaClock, FaFire, FaHeartbeat } from "react-icons/fa";
import MotionPage from "../components/MotionPage";
import Loader from "../components/Loader";
import StatCard from "../components/StatCard";
import WorkoutChart from "../components/WorkoutChart";
import ChatbotWidget from "../components/ChatbotWidget";
import { aiApiClient, userApi, workoutApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recommendation, setRecommendation] = useState([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [statsRes, workoutsRes, recommendRes] = await Promise.all([
          userApi.getStats(),
          workoutApi.getWorkouts({ limit: 7 }),
          aiApiClient.recommend({ user })
        ]);

        if (!active) return;

        const recent = workoutsRes.data.workouts || [];
        const totalWorkouts = recent.length;

        setStats({
          ...statsRes.data,
          totalWorkouts,
          recent
        });
        setRecommendation(recommendRes.data.recommendation || []);
      } catch (error) {
        console.error(error);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [user]);

  const chartData = useMemo(() => {
    if (!stats?.recent?.length) return [];
    const grouped = stats.recent.reduce((acc, workout) => {
      const day = new Date(workout.date).toLocaleDateString("en-US", { weekday: "short" });
      if (!acc[day]) acc[day] = { day, calories: 0, duration: 0 };
      acc[day].calories += workout.calories;
      acc[day].duration += workout.duration;
      return acc;
    }, {});
    return Object.values(grouped);
  }, [stats]);

  if (loading) return <Loader text="Building your fitness dashboard..." />;

  return (
    <MotionPage>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<FaHeartbeat />} label="Today Workout" value={recommendation[0]?.exercise || "Recovery"} />
        <StatCard icon={<FaBurn />} label="Calories Burned" value={`${Math.round(stats?.totalCalories || 0)} kcal`} accent="from-cyan-500 to-blue-500" />
        <StatCard icon={<FaClock />} label="Workout Time" value={`${Math.round(stats?.totalDuration || 0)} min`} accent="from-blue-500 to-purple-500" />
        <StatCard icon={<FaFire />} label="Streak" value={`${stats?.streak || 0} days`} accent="from-orange-500 to-rose-500" />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <WorkoutChart data={chartData} />

        <div className="glass-card rounded-2xl p-4">
          <h3 className="mb-3 text-lg font-semibold">Today's Workout</h3>
          <div className="space-y-2 text-sm">
            {recommendation.length ? (
              recommendation.map((item) => (
                <div key={item.exercise} className="rounded-xl bg-slate-900/60 p-3">
                  <p className="font-medium">{item.exercise}</p>
                  <p className="text-slate-300">{item.sets} sets x {item.reps} reps</p>
                </div>
              ))
            ) : (
              <p className="text-slate-400">No recommendation yet.</p>
            )}
          </div>
        </div>
      </section>

      <section className="mt-6">
        <ChatbotWidget />
      </section>
    </MotionPage>
  );
};

export default DashboardPage;
