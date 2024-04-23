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
  const { username, password, role, bandName, genre, bio, venueName, address } =
    req.body;

  if (!username || !password || !role) {
    return res.status(400).send("All fields are required");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN"); // Start transaction

    const hashedPassword = await bcrypt.hash(password, 10);
    const userResult = await client.query(
      "INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id",
      [username, hashedPassword, role]
    );
    const userId = userResult.rows[0].id;

    if (role === "artist" && bandName && genre && bio) {
      await client.query(
        "INSERT INTO artist_details (user_id, band_name, genre, bio) VALUES ($1, $2, $3, $4)",
        [userId, bandName, genre, bio]
      );
    } else if (role === "venue" && venueName && address && bio) {
      await client.query(
        "INSERT INTO venue_details (user_id, venue_name, address, bio) VALUES ($1, $2, $3, $4)",
        [userId, venueName, address, bio]
      );
    }

    await client.query("COMMIT"); // Commit transaction
    res.status(201).json({ userId: userId, role: role });
  } catch (error) {
    await client.query("ROLLBACK"); // Rollback transaction on error
    console.error("Registration error:", error);
    res.status(500).send("Server error");
  } finally {
    client.release(); // Release client back to pool
  }
});

// POST /login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send("Username and password are required.");
  }

  try {
    const query = "SELECT * FROM users WHERE username = $1";
    const { rows } = await pool.query(query, [username]);

    if (rows.length > 0) {
      const user = rows[0];
      if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
          expiresIn: "1h",
          issuer: "yourDomain.com",
        });
        res.json({ token, userId: user.id, role: user.role }); // Optionally return more user info
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

// Endpoint to get user profile
router.get("/user/profile/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    // Assuming you have a role column in your users table
    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    if (userResult.rows.length === 0) {
      return res.status(404).send("User not found");
    }

    const user = userResult.rows[0];
    if (user.role === "artist") {
      const details = await pool.query(
        "SELECT * FROM artist_details WHERE user_id = $1",
        [userId]
      );
      return res.json({ ...user, details: details.rows[0] });
    } else if (user.role === "venue") {
      const details = await pool.query(
        "SELECT * FROM venue_details WHERE user_id = $1",
        [userId]
      );
      return res.json({ ...user, details: details.rows[0] });
    } else {
      return res.json(user); // Just return basic user details if no specific role data
    }
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;