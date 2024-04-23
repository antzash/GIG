const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg"); // Ensure this is at the top with other imports
const router = express.Router();

const pool = new Pool({
  connectionString: "postgres://antzash:0420@localhost:5432/gigbase",
});

// POST /register
router.post("/register/basic", async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id",
      [username, hashedPassword, role]
    );
    res.status(201).json({ userId: result.rows[0].id, role: role });
  } catch (error) {
    console.error("Basic registration error:", error);
    res.status(500).send("Server error");
  }
});

// POST /login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const query = "SELECT * FROM users WHERE username = $1";
    const { rows } = await pool.query(query, [username]);

    if (rows.length > 0) {
      const user = rows[0];
      if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ userId: user.id }, "your_jwt_secret", {
          expiresIn: "1h",
        });
        res.json({ token });
      } else {
        res.status(401).send("Invalid credentials");
      }
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Server error");
  }
});

// Routes to register artist details

router.post("/register/artist/details", async (req, res) => {
  const { userId, artistName, genre, bio, bandMembers } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO artist_details (user_id, artist_name, genre, bio, band_members) VALUES ($1, $2, $3, $4, $5)",
      [userId, artistName, genre, bio, JSON.stringify(bandMembers)]
    );
    res.status(201).send("Artist details added successfully.");
  } catch (error) {
    console.error("Artist details registration error:", error);
    res.status(500).send("Server error");
  }
});

// Routes to register Venue Details

router.post("/register/venue/details", async (req, res) => {
  const { userId, venueName, location, website, address, bio } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO venue_details (user_id, venue_name, location, website, address, bio) VALUES ($1, $2, $3, $4, $5, $6)",
      [userId, venueName, location, website, address, bio]
    );
    res.status(201).send("Venue details added successfully.");
  } catch (error) {
    console.error("Venue details registration error:", error);
    res.status(500).send("Server error");
  }
});

module.exports = router;
