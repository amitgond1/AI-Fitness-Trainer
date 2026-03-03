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

const calculateCalories = ({ exercise, durationMinutes, weightKg }) => {
  const met = MET_VALUES[exercise] || MET_VALUES.default;
  return Number(((met * 3.5 * weightKg) / 200 * durationMinutes).toFixed(2));
};

module.exports = { calculateCalories };
