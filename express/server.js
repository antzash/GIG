const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5001;
require("dotenv").config();

// Body parsing middleware setup
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// CORS middleware
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5001", // Adjust this to your client's origin for security
    methods: ["GET", "POST"],
  },
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("a user connected");

  // Listen for chat message
  socket.on("chat message", (msg) => {
    console.log("message: " + msg);
    // Broadcast the message to all connected clients
    io.emit("chat message", msg);
  });

  // Disconnect handler
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

const { Pool } = require("pg");
const pool = new Pool({
  connectionString: "postgres://antzash:0420@localhost:5432/gigbase",
});

// Import auth router
const authRouter = require("./Routers/routers");
app.use("/api", authRouter);

app.get("/", async (req, res) => {
  const client = await pool.connect();
  const { rows } = await client.query("SELECT NOW()");
  client.release();
  res.send(rows[0]);
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
