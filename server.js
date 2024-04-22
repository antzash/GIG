const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5001;

// Body parsing middleware setup
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// CORS middleware
app.use(cors());

const { Pool } = require("pg");
const pool = new Pool({
  connectionString: "postgres://antzash:0420@localhost:5432/gigbase",
});

// Import auth router
const authRouter = require("./Routers/auth-routers");
app.use("/api/auth", authRouter);

app.get("/", async (req, res) => {
  const client = await pool.connect();
  const { rows } = await client.query("SELECT NOW()");
  client.release();
  res.send(rows[0]);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
