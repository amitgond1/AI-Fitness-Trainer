import { motion } from "framer-motion";

const ExerciseCard = ({ exercise }) => (
  <motion.article
    whileHover={{ y: -5 }}
    className="glass-card overflow-hidden rounded-2xl"
  >
    <img src={exercise.image} alt={exercise.name} className="h-40 w-full object-cover" />
    <div className="space-y-2 p-4">
      <h3 className="text-lg font-semibold">{exercise.name}</h3>
      <p className="text-sm text-slate-300">{exercise.instructions}</p>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-indigo-500/25 px-2 py-1">{exercise.difficulty}</span>
        <span className="rounded-full bg-cyan-500/25 px-2 py-1">{exercise.calories} kcal / 15 min</span>
      </div>
      <div className="aspect-video w-full overflow-hidden rounded-lg border border-slate-700">
        <iframe
          title={`${exercise.name} video`}
          src={exercise.video}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  </motion.article>
);

export default ExerciseCard;
