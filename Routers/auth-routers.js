const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg"); // Ensure this is at the top with other imports
const router = express.Router();

const pool = new Pool({
  connectionString: "postgres://antzash:0420@localhost:5432/gigbase",
});

// POST /register
router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id",
      [username, hashedPassword, role]
    );
    if (result.rows.length > 0) {
      res.status(201).send("User registered");
    } else {
      res.status(400).send("User not registered");
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).send("Server error");
  }
});

// POST /login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    // Find the user by username
    // Example: const user = await User.findOne({ where: { username } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ userId: user.id }, "your_jwt_secret", {
        expiresIn: "1h",
      });
      res.json({ token });
    } else {
      res.status(401).send("Invalid credentials");
    }
  } catch (error) {
    res.status(500).send("Server error");
  }
});

module.exports = router;
