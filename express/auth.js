const jwt = require("jsonwebtoken");

function generateToken(user) {
  const secret = process.env.JWT_SECRET; // Make sure this is correctly referencing the environment variable
  if (!secret) {
    throw new Error(
      "JWT secret is not set. Check your .env file and environment."
    );
  }
  return jwt.sign({ userId: user.id, role: user.role }, secret, {
    expiresIn: "24h",
  });
}

function verifyToken(token) {
  return jwt.verify(token, secret);
}

module.exports = { generateToken, verifyToken };
