const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 5001;
const { Pool } = require("pg");
const pool = new Pool({
  connectionString: "postgres://antzash:0420@localhost:5432/gigbase",
});
// Import auth router
const authRouter = require("./Routers/auth-routers");

// Use the router variable
app.use("/api/auth", authRouter);

app.use(cors());
app.use(bodyParser.json());

app.get("/", async (req, res) => {
  const client = await pool.connect();
  const { rows } = await client.query("SELECT NOW()");
  client.release();
  res.send(rows[0]);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
