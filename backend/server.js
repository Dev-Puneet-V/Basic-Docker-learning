const express = require("express");
const mongoose = require("mongoose");
const WebSocket = require("ws");
const cors = require("cors");
require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://database:27017/myapp")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Todo Model
const Todo = mongoose.model("Todo", {
  text: String,
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// WebSocket Server
const wss = new WebSocket.Server({ port: process.env.WEBSOCKET_PORT || 3001 });

// Broadcast to all connected clients
const broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// WebSocket connection handling
wss.on("connection", (ws) => {
  console.log("New WebSocket client connected");

  ws.on("message", async (message) => {
    const data = JSON.parse(message);
    if (data.type === "toggleTodo") {
      const todo = await Todo.findById(data.id);
      if (todo) {
        todo.completed = !todo.completed;
        await todo.save();
        broadcast({ type: "todoUpdated", todo });
      }
    }
  });
});

// REST API Routes
app.get("/api/todos", async (req, res) => {
  const todos = await Todo.find().sort({ createdAt: -1 });
  res.json(todos);
});

app.post("/api/todos", async (req, res) => {
  const todo = new Todo({ text: req.body.text });
  await todo.save();
  broadcast({ type: "newTodo", todo });
  res.json(todo);
});

app.delete("/api/todos/:id", async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  broadcast({ type: "todoDeleted", id: req.params.id });
  res.json({ success: true });
});

// Start REST API server
const restPort = process.env.REST_PORT || 3000;
app.listen(restPort, "0.0.0.0", () => {
  console.log(`REST API running on port ${restPort}`);
  console.log(
    `WebSocket server running on port ${process.env.WEBSOCKET_PORT || 3001}`
  );
});
