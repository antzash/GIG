const jwt = require("jsonwebtoken");

const authenticateVenue = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send("Access denied. No token provided.");
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT:", decoded);
    if (decoded.role !== "venue") {
      return res.status(403).send("Access denied. Not authorized.");
    }

    req.user = decoded; // Add decoded token info to req.user
    next();
  } catch (error) {
    console.error("Token Verification Error:", error);
    res.status(400).send("Invalid token.");
  }
};

const authenticateArtist = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send("Access denied. No token provided.");
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT:", decoded);
    if (decoded.role !== "artist") {
      return res.status(403).send("Access denied. Not authorized.");
    }

    req.user = decoded; // Add decoded token info to req.user
    next();
  } catch (error) {
    console.error("Token Verification Error:", error);
    res.status(400).send("Invalid token.");
  }
};

module.exports = { authenticateVenue, authenticateArtist };
