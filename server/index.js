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

// Normalize FRONTEND_ORIGIN from env and include local dev origins
const frontendOriginRaw = (process.env.FRONTEND_ORIGIN || "").trim();
const frontendOrigin = frontendOriginRaw.replace(/\/$/, ""); 
const allowedOrigins = [
  ...(frontendOrigin ? [frontendOrigin] : []),
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",  
  "http://127.0.0.1:3000"
];

// Log to confirm what the server thinks
console.log("FRONTEND_ORIGIN (env):", JSON.stringify(frontendOriginRaw));
console.log("Allowed origins:", allowedOrigins);

// Express CORS: function-based origin check so header is returned only for allowed origins
app.use(
  cors({
    origin: function (origin, callback) {
      // allow non-browser tools (curl, Postman) by permitting no-origin requests
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      console.warn("CORS rejected origin:", origin);
      return callback(new Error("CORS rejected origin: " + origin), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"]
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);

// DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo Connected"))
  .catch((err) => {
    console.error("Mongo connection error:", err);
    process.exit(1);
  });

// Socket.IO init with same allowed origins
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true
  }
});

// socket.io handlers
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("joinPlaceRoom", (placeId) => {
    socket.join(placeId);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Routes using factory that needs io
const queueRoutes = queueRoutesFactory(io);
app.use("/api", queueRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

