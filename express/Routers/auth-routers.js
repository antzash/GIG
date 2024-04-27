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

// Offer gig to artist.
router.post(
  "/gigs/offer/:gigId/:artistId",
  authenticateVenue,
  async (req, res) => {
    const { gigId, artistId } = req.params;
    const userId = req.user.userId; // Assuming authenticateVenue attaches the user details to req.user

    try {
      // First, fetch the band_name of the artist who is being offered the gig
      const { rows: artistDetails } = await pool.query(
        "SELECT band_name FROM artist_details WHERE user_id = $1",
        [artistId]
      );

      if (artistDetails.length === 0) {
        return res.status(400).send("Artist details not found.");
      }

      const bandName = artistDetails[0].band_name;

      // Check if the gig belongs to the venue making the offer
      const gigCheck = await pool.query(
        "SELECT 1 FROM gigs WHERE id = $1 AND user_id = $2",
        [gigId, userId]
      );

      if (gigCheck.rows.length === 0) {
        return res
          .status(403)
          .send("You can only offer gigs that you have created.");
      }

      // Then, update the gig's offered_to column with the band_name
      const updateResult = await pool.query(
        "UPDATE gigs SET offered_to = $1 WHERE id = $2 AND offered_to IS NULL",
        [bandName, gigId]
      );

      if (updateResult.rowCount === 0) {
        return res
          .status(400)
          .send("Gig not available for offer or already offered");
      }

      res.json({ message: "Gig offered successfully", offered_to: bandName });
    } catch (error) {
      console.error("Failed to offer gig:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Retract offer as venue
router.post(
  "/gigs/retract/:gigId/:artistId",
  authenticateVenue,
  async (req, res) => {
    const { gigId, artistId } = req.params;
    const userId = req.user.userId; // Assuming authenticateVenue attaches the user details to req.user

    try {
      // Check if the gig belongs to the venue making the retract request
      const gigCheck = await pool.query(
        "SELECT 1 FROM gigs WHERE id = $1 AND user_id = $2 AND offered_to IS NOT NULL",
        [gigId, userId]
      );

      if (gigCheck.rows.length === 0) {
        return res
          .status(403)
          .send("You can only retract offers that you have made.");
      }

      // Retract the offer by setting the offered_to column back to NULL
      const updateResult = await pool.query(
        "UPDATE gigs SET offered_to = NULL, accepted_by = NULL WHERE id = $1 AND offered_to IS NOT NULL",
        [gigId]
      );

      if (updateResult.rowCount === 0) {
        return res
          .status(400)
          .send(
            "Failed to retract offer. The gig might not have an offer or the offer has already been retracted."
          );
      }

      res.json({ message: "Offer retracted successfully" });
    } catch (error) {
      console.error("Failed to retract offer:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Fetch all artists
router.get("/artists", async (req, res) => {
  try {
    // Query to select both 'user_id' and 'band_name' from the 'artist_details' table
    const result = await pool.query(
      "SELECT user_id, band_name, genre, bio FROM artist_details"
    );
    // The result will now include both user_id and band_name for each artist
    res.json(result.rows);
  } catch (error) {
    console.error("Failed to retrieve artists:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Fetch all venues
router.get("/venues", async (req, res) => {
  try {
    // Query to select both 'user_id' and 'venue_name' from the 'venue_details' table
    const result = await pool.query(
      "SELECT user_id, venue_name, address, bio FROM venue_details"
    );
    // The result will now include both user_id and band_name for each artist
    res.json(result.rows);
  } catch (error) {
    console.error("Failed to retrieve venues:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Fetch offered gigs
router.get("/gigs/offered", authenticateArtist, async (req, res) => {
  try {
    // Extract the user's ID from the request object
    const userId = req.user.userId;

    // Query to select gigs where the offered_to column matches the artist's band name
    const result = await pool.query(
      "SELECT * FROM gigs WHERE offered_to = (SELECT band_name FROM artist_details WHERE user_id = $1)",
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Failed to retrieve offered gigs:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Accept Gigs as an Artist
router.post("/gigs/accept/:gigId", authenticateArtist, async (req, res) => {
  const { gigId } = req.params;
  const userId = req.user.userId; // Assuming authenticateArtist attaches the user details to req.user

  try {
    // Fetch the artist's band name
    const { rows: artistDetails } = await pool.query(
      "SELECT band_name FROM artist_details WHERE user_id = $1",
      [userId]
    );

    if (artistDetails.length === 0) {
      return res.status(400).send("Artist details not found.");
    }

    const bandName = artistDetails[0].band_name;

    // Update the gig's accepted_by column with the band_name
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

// Reject Offer as Artist
router.post("/gigs/reject/:gigId", authenticateArtist, async (req, res) => {
  const { gigId } = req.params;
  const userId = req.user.userId; // Assuming authenticateArtist attaches the user details to req.user

  try {
    // Check if the gig is offered to the artist making the rejection request
    const gigCheck = await pool.query(
      "SELECT 1 FROM gigs WHERE id = $1 AND offered_to = (SELECT band_name FROM artist_details WHERE user_id = $2)",
      [gigId, userId]
    );

    if (gigCheck.rows.length === 0) {
      return res
        .status(403)
        .send("You can only reject offers that you have received.");
    }

    // Reject the offer by setting the offered_to column back to NULL
    const updateResult = await pool.query(
      "UPDATE gigs SET offered_to = NULL, accepted_by = NULL WHERE id = $1 AND offered_to IS NOT NULL",
      [gigId]
    );

    if (updateResult.rowCount === 0) {
      return res
        .status(400)
        .send(
          "Failed to reject offer. The gig might not have an offer or the offer has already been rejected."
        );
    }

    res.json({ message: "Offer rejected successfully" });
  } catch (error) {
    console.error("Failed to reject offer:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Write A Review (Artist to Venue)
router.post(
  "/reviews/artist-to-venue",
  authenticateArtist,
  async (req, res) => {
    const { reviewee_id, content } = req.body;
    const reviewer_id = req.user.userId; // Assuming authenticateArtist attaches the user details to req.user

    // Validate input
    if (!reviewee_id || !content) {
      return res.status(400).send("All fields are required");
    }

    try {
      // Insert the review into the database
      const query = `
       INSERT INTO reviews (reviewer_id, reviewee_id, content)
       VALUES ($1, $2, $3)
       RETURNING *;
     `;

      const result = await pool.query(query, [
        reviewer_id,
        reviewee_id,
        content,
      ]);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).send("Failed to create review due to server error.");
    }
  }
);

// Write Review (Venue to Artist)
router.post("/reviews/venue-to-artist", authenticateVenue, async (req, res) => {
  const { reviewee_id, content } = req.body;
  const reviewer_id = req.user.userId; // Assuming authenticateVenue attaches the user details to req.user

  // Validate input
  if (!reviewee_id || !content) {
    return res.status(400).send("All fields are required");
  }

  try {
    // Insert the review into the database
    const query = `
       INSERT INTO reviews (reviewer_id, reviewee_id, content)
       VALUES ($1, $2, $3)
       RETURNING *;
     `;

    const result = await pool.query(query, [reviewer_id, reviewee_id, content]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).send("Failed to create review due to server error.");
  }
});

// Get Reviews by User
router.get("/reviews/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Query to select reviews where the reviewee_id matches the userId
    const result = await pool.query(
      "SELECT * FROM reviews WHERE reviewee_id = $1",
      [userId]
    );
    // Return an empty array with a 200 status code if no reviews are found
    if (result.rows.length === 0) {
      return res.status(200).json([]);
    }
    res.json(result.rows);
  } catch (error) {
    console.error("Failed to retrieve reviews:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Get All Users
router.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (error) {
    console.error("Failed to retrieve users:", error);
    res.status(500).send("Internal Server Error");
  }
});

//Store Chat Messages in Postgres
router.post("/messages", async (req, res) => {
  const { senderId, recipientId, message } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO chat_messages (sender_id, recipient_id, message) VALUES ($1, $2, $3) RETURNING *",
      [senderId, recipientId, message]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error storing message:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Retrieve Chat between Users
router.get("/messages/:senderId/:recipientId", async (req, res) => {
  const { senderId, recipientId } = req.params;

  try {
    // Query to fetch messages between the sender and recipient
    const result = await pool.query(
      `SELECT * FROM chat_messages WHERE (sender_id = $1 AND recipient_id = $2) OR (sender_id = $2 AND recipient_id = $1) ORDER BY sent_at`,
      [senderId, recipientId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("No messages found between these users.");
    }

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
