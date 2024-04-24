const express = require("express");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
const { generateToken } = require("../auth"); // Import the generateToken function
const router = express.Router();

const pool = new Pool({
  connectionString: "postgres://antzash:0420@localhost:5432/gigbase",
});

const {
  authenticateVenue,
  authenticateArtist,
} = require("../Middleware/middleware");

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
        // Generate token with user details including role
        const token = generateToken(user);
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

// Endpoint to post gigs (as venue)
router.post("/gigs", authenticateVenue, async (req, res) => {
  const { title, description, date, pay, time } = req.body;
  const userId = req.user.userId; // Ensure this is correctly fetching the user_id from the authenticated user

  if (!userId) {
    return res.status(400).send("User ID is missing from the request.");
  }

  try {
    const query = `
      INSERT INTO gigs (user_id, venue_name, title, description, date, pay, time)
      VALUES ($1, (SELECT venue_name FROM venue_details WHERE user_id = $1), $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const result = await pool.query(query, [
      userId,
      title,
      description,
      date,
      pay,
      time,
    ]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error posting gig:", error);
    res.status(500).send("Failed to post gig due to server error.");
  }
});

// Endpoint to delete gigs (as venue)
router.delete("/gigs/:gigId", authenticateVenue, async (req, res) => {
  const { gigId } = req.params;
  const userId = req.user.userId; // Assuming authenticateVenue attaches the user details to req.user

  try {
    // First, verify that the logged-in venue is the owner of the gig
    const ownershipCheck = await pool.query(
      "SELECT user_id FROM gigs WHERE id = $1",
      [gigId]
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(404).send("Gig not found.");
    }

    if (ownershipCheck.rows[0].user_id !== userId) {
      return res
        .status(403)
        .send("Access denied. You can only delete gigs that you have posted.");
    }

    // If the user is verified as the owner, delete the gig
    const deleteQuery = await pool.query("DELETE FROM gigs WHERE id = $1", [
      gigId,
    ]);

    res.status(200).send("Gig deleted successfully.");
  } catch (error) {
    console.error("Error deleting gig:", error);
    res.status(500).send("Failed to delete gig due to server error.");
  }
});

// View All Gigs
router.get("/gigs", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM gigs");
    res.json(result.rows);
  } catch (error) {
    console.error("Failed to retrieve gigs:", error);
    res.status(500).send("Internal Server Error");
  }
});

// View Gigs by Id (Venue)
router.get("/user/profile/:userId/gigs", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query("SELECT * FROM gigs WHERE user_id = $1", [
      userId,
    ]);
    // Return an empty array with a 200 status code if no gigs are found
    if (result.rows.length === 0) {
      return res.status(200).json([]);
    }
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching gigs by user ID:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Accept Gigs as artists
router.post("/gigs/accept/:gigId", authenticateArtist, async (req, res) => {
  const { gigId } = req.params;
  const userId = req.user.userId; // Assuming authenticateArtist attaches the user details to req.user

  try {
    // First, fetch the band_name of the artist who is logged in
    const { rows: artistDetails } = await pool.query(
      "SELECT band_name FROM artist_details WHERE user_id = $1",
      [userId]
    );

    if (artistDetails.length === 0) {
      return res.status(400).send("Artist details not found.");
    }

    const bandName = artistDetails[0].band_name;

    // Then, update the gig's accepted_by column with the band_name
    const updateResult = await pool.query(
      "UPDATE gigs SET accepted_by = $1 WHERE id = $2 AND accepted_by IS NULL",
      [bandName, gigId]
    );

    if (updateResult.rowCount === 0) {
      return res
        .status(400)
        .send("Gig not available for acceptance or already accepted");
    }

    res.json({ message: "Gig accepted successfully", accepted_by: bandName });
  } catch (error) {
    console.error("Failed to accept gig:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
