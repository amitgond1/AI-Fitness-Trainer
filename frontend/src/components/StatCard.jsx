import { motion } from "framer-motion";

const StatCard = ({ icon, label, value, accent = "from-indigo-500 to-cyan-400" }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.01 }}
    className="glass-card rounded-2xl p-4 shadow-lg"
  >
    <div className="mb-2 flex items-center justify-between">
      <span className={`rounded-lg bg-gradient-to-r ${accent} p-2 text-white`}>{icon}</span>
      <p className="text-xs text-slate-400">Live</p>
    </div>
    <p className="text-sm text-slate-300">{label}</p>
    <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
  </motion.div>
);

export default StatCard;
