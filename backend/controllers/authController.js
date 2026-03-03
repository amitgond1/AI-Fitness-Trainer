const crypto = require("crypto");
const User = require("../models/User");
const { generateToken } = require("../utils/token");

const resolveClientOrigin = () => {
  const raw = process.env.CORS_ORIGIN || "http://localhost:5173";
  const origin = raw
    .split(",")
    .map((item) => item.trim())
    .find(Boolean);
  return (origin || "http://localhost:5173").replace(/\/+$/, "");
};

const signup = async (req, res, next) => {
  try {
    const { name, email, password, age, height, weight, goal } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const user = await User.create({ name, email, password, age, height, weight, goal });

    const token = generateToken({ id: user._id, email: user.email });
    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        height: user.height,
        weight: user.weight,
        goal: user.goal
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = generateToken({ id: user._id, email: user.email }, rememberMe);
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        height: user.height,
        weight: user.weight,
        goal: user.goal,
        streak: user.streak,
        achievements: user.achievements
      }
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  return res.json({ message: "Logged out successfully." });
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: "If the account exists, a reset link has been generated." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 60;
    await user.save();

    const resetUrl = `${resolveClientOrigin()}/reset-password/${resetToken}`;
    return res.json({
      message: "Reset token generated. Integrate email provider in production.",
      resetUrl
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password are required." });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ message: "Password reset successful." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword
};
