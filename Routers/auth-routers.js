const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

// POST /register
router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    // Save the new user to your database
    // Example: User.create({ username, password: hashedPassword, role })
    res.status(201).send("User registered");
  } catch (error) {
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
