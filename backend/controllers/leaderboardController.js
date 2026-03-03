const User = require("../models/User");
const Workout = require("../models/Workout");

const getLeaderboard = async (req, res, next) => {
  try {
    const leaderboard = await Workout.aggregate([
      {
        $group: {
          _id: "$userId",
          totalCalories: { $sum: "$calories" },
          totalDuration: { $sum: "$duration" },
          workoutCount: { $sum: 1 }
        }
      },
      { $sort: { totalCalories: -1 } },
      { $limit: 10 }
    ]);

    const users = await User.find({ _id: { $in: leaderboard.map((entry) => entry._id) } }).select("name streak");
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const data = leaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry._id,
      name: userMap.get(entry._id.toString())?.name || "Unknown",
      streak: userMap.get(entry._id.toString())?.streak || 0,
      totalCalories: Number(entry.totalCalories.toFixed(2)),
      totalDuration: entry.totalDuration,
      workoutCount: entry.workoutCount
    }));

    return res.json({ leaderboard: data });
  } catch (error) {
    next(error);
  }
};

module.exports = { getLeaderboard };
