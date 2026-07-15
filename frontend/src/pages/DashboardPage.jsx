import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaBurn, FaChartLine, FaClock, FaFire, FaHeartbeat } from "react-icons/fa";
import MotionPage from "../components/MotionPage";
import Loader from "../components/Loader";
import StatCard from "../components/StatCard";
import WorkoutChart from "../components/WorkoutChart";
import ChatbotWidget from "../components/ChatbotWidget";
import { aiApiClient, progressApi, userApi, workoutApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recommendation, setRecommendation] = useState([]);
  const [trainingPlan, setTrainingPlan] = useState(null);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [statsRes, workoutsRes, recommendRes, planRes, progressRes] = await Promise.all([
          userApi.getStats(),
          workoutApi.getWorkouts({ limit: 7 }),
          aiApiClient.recommend({ user }),
          workoutApi.getTrainingPlan(),
          progressApi.getOverview()
        ]);

        if (!active) return;

        const recent = workoutsRes.data.workouts || [];
        setStats({
          ...statsRes.data,
          recent
        });
        setRecommendation(recommendRes.data.recommendation || []);
        setTrainingPlan(planRes.data);
        setProgress(progressRes.data);
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

  const todayPlan = useMemo(() => {
    const day = new Date().toLocaleDateString("en-US", { weekday: "long" });
    return trainingPlan?.days?.find((item) => item.day === day);
  }, [trainingPlan]);

  if (loading) return <Loader text="Building your fitness dashboard..." />;

  return (
    <MotionPage>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<FaHeartbeat />} label="Today focus" value={todayPlan?.focus || recommendation[0]?.exercise || "Recovery"} />
        <StatCard icon={<FaBurn />} label="Calories Burned" value={`${Math.round(stats?.totalCalories || 0)} kcal`} accent="from-cyan-500 to-blue-500" />
        <StatCard icon={<FaClock />} label="Workout Time" value={`${Math.round(stats?.totalDuration || 0)} min`} accent="from-blue-500 to-purple-500" />
        <StatCard icon={<FaFire />} label="Streak" value={`${stats?.streak || 0} days`} accent="from-orange-500 to-rose-500" />
      </section>

      <Link to="/progress" className="mt-4 flex flex-col gap-3 rounded-2xl border border-teal-400/20 bg-gradient-to-r from-teal-400/10 via-slate-900/70 to-orange-400/10 p-4 transition hover:border-teal-300/40 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3"><span className="rounded-xl bg-teal-400/15 p-3 text-teal-300"><FaChartLine /></span><div><p className="font-black">Your progress story</p><p className="text-xs text-slate-400">Body trends aur personal records dekho</p></div></div>
        <div className="flex gap-4 text-sm"><span><b className="text-orange-200">{progress?.records?.heaviestLift?.weightLiftedKg || 0} kg</b><small className="ml-1 text-slate-500">best lift</small></span><span className="font-bold text-teal-200">Open progress →</span></div>
      </Link>

      <section className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <WorkoutChart data={chartData} />

        <div className="glass-card rounded-2xl p-4">
          <h3 className="mb-1 text-lg font-semibold">Today's plan</h3>
          {todayPlan && <p className="mb-3 text-xs text-slate-400">{todayPlan.targetMinutes} min target · {todayPlan.isRestDay ? "Recovery day" : "Training day"}</p>}
          <div className="space-y-2 text-sm">
            {todayPlan?.exercises?.length ? (
              todayPlan.exercises.map((exercise) => (
                <div key={exercise} className="rounded-xl bg-slate-900/60 p-3 font-medium">{exercise}</div>
              ))
            ) : recommendation.length ? (
              recommendation.map((item) => <div key={item.exercise} className="rounded-xl bg-slate-900/60 p-3"><p className="font-medium">{item.exercise}</p><p className="text-slate-300">{item.sets} sets x {item.reps} reps</p></div>)
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
