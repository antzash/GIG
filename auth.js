const jwt = require("jsonwebtoken");
const secret = "your_jwt_secret"; // Use an environment variable in production

function generateToken(user) {
  return jwt.sign({ userId: user.id }, secret, { expiresIn: "24h" });
}

function verifyToken(token) {
  return jwt.verify(token, secret);
}

module.exports = { generateToken, verifyToken };
