import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import morgan from "morgan";
import * as middleware from "./utils/middleware.js";
import helloRoute from "./routes/helloRouter.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// parse json request body
app.use(express.json());

// enable CORS for Express routes
app.use(cors());

// request logger middleware
app.use(morgan("tiny"));

// healthcheck endpoint
app.get("/", (req, res) => {
  res.status(200).send({ status: "ok" });
});

app.use("/hello", helloRoute);

// custom middleware
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

// Handle WebSocket connections
io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Handle incoming messages from clients
  socket.on("message", (message) => {
    // Broadcast the message to all connected clients (including the sender)
    io.emit("message", message);
  });

  // Handle disconnections
  socket.on("disconnect", () => {
    console.log(`A user disconnected: ${socket.id}`);
  });
});

// Start the server
const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`WebSocket server is running on port ${port}`);
});

export { app, server };
