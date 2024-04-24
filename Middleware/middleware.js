const jwt = require("jsonwebtoken");

const authenticateVenue = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send("Access denied. No token provided.");
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "venue") {
      return res.status(403).send("Access denied. Not authorized.");
    }

    console.log("Decoded JWT:", decoded); // Log to verify contents of decoded token
    req.user = decoded; // Add decoded token info to req.user
    next();
  } catch (error) {
    console.error("Token Verification Error:", error);
    res.status(400).send("Invalid token.");
  }
};

const authenticateArtist = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Assuming the token is sent as a Bearer token

  if (!token) {
    return res.status(401).send("Access denied. No token provided.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Check if the user's role is 'artist'
    if (req.user.role !== "artist") {
      return res.status(403).send("Access denied. Not authorized.");
    }

    next();
  } catch (error) {
    res.status(400).send("Invalid token.");
  }
};

module.exports = authenticateArtist;

module.exports = authenticateVenue;
