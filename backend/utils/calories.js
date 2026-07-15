const MET_VALUES = {
  Pushups: 8,
  Squats: 5,
  Plank: 3,
  Lunges: 6,
  "Jumping Jacks": 8,
  Running: 9,
  Yoga: 3,
  default: 5
};

const ACTIVITY_MET_VALUES = {
  gym: 6,
  running: 9.8,
  walking: 3.5,
  cycling: 7.5,
  yoga: 3,
  sports: 7,
  other: 5
};

const calculateCalories = ({ exercise, activityType, durationMinutes, weightKg }) => {
  const met = MET_VALUES[exercise] || ACTIVITY_MET_VALUES[activityType] || MET_VALUES.default;
  return Number(((met * 3.5 * weightKg) / 200 * durationMinutes).toFixed(2));
};

module.exports = { calculateCalories };
