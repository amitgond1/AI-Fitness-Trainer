import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaBolt, FaChartLine, FaDumbbell, FaMobileAlt, FaRobot, FaShieldAlt } from "react-icons/fa";

const features = [
  { icon: <FaRobot />, title: "AI Workout Coach", text: "Session plans adapt to your profile, streak, and history." },
  { icon: <FaDumbbell />, title: "Pose Detection", text: "Rep tracking with live form warnings while you train." },
  { icon: <FaChartLine />, title: "Progress Analytics", text: "Daily performance, calories, and trend visibility." },
  { icon: <FaBolt />, title: "Streak Engine", text: "Milestones and badges to keep momentum high." },
  { icon: <FaMobileAlt />, title: "Phone First UX", text: "Built for portrait workouts with camera support." },
  { icon: <FaShieldAlt />, title: "Secure Accounts", text: "JWT sessions, encrypted passwords, and profile controls." }
];

const screenshots = [
  "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=1469&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop"
];

const testimonials = [
  { name: "Olivia K.", quote: "The posture feedback changed how I train. My form improved in two weeks." },
  { name: "Marcus D.", quote: "Feels like a real AI coach. I hit a 7-day streak for the first time." },
  { name: "Nina R.", quote: "Love the dashboard and reminders. Works great on my phone camera." }
];

const stats = [
  { label: "Avg Session", value: "34 min" },
  { label: "Users Active", value: "18k+" },
  { label: "Form Accuracy", value: "95%" }
];

const LandingPage = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-mesh text-slate-100">
      <section className="relative overflow-hidden px-4 pb-14 pt-7 sm:px-6 md:px-10 md:pb-20 md:pt-14">
        <span className="float-orb absolute -left-10 top-20 h-36 w-36 rounded-full bg-orange-400/20 blur-2xl" />
        <span className="float-orb absolute -right-12 top-12 h-44 w-44 rounded-full bg-teal-400/20 blur-2xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <p className="mb-4 inline-flex rounded-full border border-orange-300/40 bg-orange-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-orange-200">
              Smart Fitness SaaS
            </p>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl md:text-6xl">Train Better With AI, Anywhere.</h1>
            <p className="mt-4 max-w-xl text-base text-slate-200 sm:text-lg">
              Real-time posture tracking, adaptive workouts, and progress analytics in one responsive fitness platform.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/signup" className="gradient-btn rounded-xl px-6 py-3 text-center font-semibold text-white shadow-glow">
                Start Training
              </Link>
              <Link to="/login" className="rounded-xl border border-white/25 bg-white/5 px-6 py-3 text-center font-semibold text-slate-100 transition hover:border-teal-300/60 hover:bg-white/10">
                Login
              </Link>
            </div>

            <div className="stagger-children mt-7 grid grid-cols-3 gap-2 sm:gap-3">
              {stats.map((item) => (
                <div key={item.label} className="glass-card rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-orange-200 sm:text-xl">{item.value}</p>
                  <p className="text-[11px] text-slate-300 sm:text-xs">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="relative"
          >
            <img
              src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop"
              alt="Workout hero"
              className="h-[280px] w-full rounded-3xl object-cover shadow-2xl sm:h-[360px] lg:h-[470px]"
            />

            <div className="glass-card absolute bottom-3 left-3 right-3 rounded-2xl p-3 sm:bottom-4 sm:right-auto sm:w-[78%] sm:p-4">
              <p className="text-xs text-slate-300">Live Counter</p>
              <p className="text-xl font-bold text-orange-200 sm:text-2xl">Pushups: 12 reps</p>
              <p className="mt-1 text-xs text-teal-200">Posture: shoulders aligned</p>
            </div>
            <div className="glass-card absolute right-3 top-3 hidden rounded-xl px-3 py-2 text-sm sm:block">
              <p className="text-slate-300">Streak</p>
              <p className="font-bold text-teal-200">7 days</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-10 md:py-14">
        <h2 className="section-title">Features</h2>
        <div className="stagger-children mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -6, rotate: -0.3 }}
              className="glass-card rounded-2xl p-5"
            >
              <div className="mb-2 inline-flex rounded-lg bg-orange-300/20 p-2 text-orange-200">{feature.icon}</div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-1 text-sm text-slate-200">{feature.text}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-10 md:py-14">
        <h2 className="section-title">Screenshots</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {screenshots.map((src, index) => (
            <motion.div key={src} whileHover={{ y: -6 }} className="glass-card overflow-hidden rounded-2xl">
              <img src={src} alt="Fitness app screenshot" className="h-52 w-full object-cover sm:h-56" />
              <div className="flex items-center justify-between px-4 py-3 text-xs text-slate-200">
                <span>Screen {index + 1}</span>
                <span className="rounded-full bg-teal-400/20 px-2 py-0.5 text-teal-200">Mobile Ready</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-10 md:py-14">
        <h2 className="section-title">Benefits</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="glass-card rounded-2xl p-5">Adaptive plans that scale with your fitness level.</div>
          <div className="glass-card rounded-2xl p-5">Live correction prompts to improve form quality.</div>
          <div className="glass-card rounded-2xl p-5">Competitive stats, reminders, and leaderboard tracking.</div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-10 md:py-14">
        <h2 className="section-title">Testimonials</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="glass-card rounded-2xl p-5">
              <p className="text-sm text-slate-200">"{item.quote}"</p>
              <p className="mt-3 text-sm font-semibold text-teal-200">{item.name}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-6 pt-4 sm:px-6 md:px-10">
        <div className="glass-card rounded-3xl px-5 py-6 text-center sm:px-8 sm:py-8">
          <p className="text-sm uppercase tracking-[0.2em] text-orange-200">Ready To Start</p>
          <h3 className="mt-2 text-2xl font-bold sm:text-3xl">Build your strongest routine with AI guidance.</h3>
          <Link to="/signup" className="gradient-btn mt-5 inline-flex rounded-xl px-6 py-3 font-semibold text-white">
            Create Free Account
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-slate-300">
        AI Fitness Trainer SaaS | Built with React, Node, MongoDB, FastAPI, and MediaPipe
      </footer>
    </div>
  );
};

export default LandingPage;
