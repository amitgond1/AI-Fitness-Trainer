const jwt = require("jsonwebtoken");

const generateToken = (payload, rememberMe = false) => {
  const defaultExpire = process.env.JWT_EXPIRE || "1d";
  const expiresIn = rememberMe ? "30d" : defaultExpire;
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

module.exports = { generateToken };
