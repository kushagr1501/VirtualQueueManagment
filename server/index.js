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
  cors: { 
    origin: process.env.FRONTEND_ORIGIN, 
    methods: ["GET", "POST", "PATCH"],
    credentials: true
  }
});


app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN ,      
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true
  })
);

app.use(express.json());
app.use("/api/auth", authRoutes);

// DB

mongoose.connect(process.env.MONGO_URI).then(() => console.log("Mongo Connected"));
  
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
