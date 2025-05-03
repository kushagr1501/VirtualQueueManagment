import express from "express";
import http from "http";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import queueRoutesFactory from "./routes/queue.routes.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST", "PATCH"] }
});

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
// DB
mongoose.connect(process.env.MONGO_URI).then(() => console.log("Mongo Connected"));

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("joinPlaceRoom", (placeId) => {
    socket.join(placeId);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});

// Routes
const queueRoutes = queueRoutesFactory(io);
app.use("/api", queueRoutes);

// Start
server.listen(5000, () => console.log("Server running on 5000"));
