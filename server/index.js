import express from "express";
import http from "http";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import { Server } from "socket.io";
import queueRoutesFactory from "./routes/queue.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Security headers
app.use(helmet());

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

// Express CORS
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.match(/^http:\/\/localhost:\d+$/) || origin.match(/^http:\/\/127\.0\.0\.1:\d+$/)) {
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    // In production, reject unknown origins
    if (process.env.NODE_ENV === "production") {
      return callback(new Error("Not allowed by CORS"));
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"]
};

app.use(cors(corsOptions));
app.use(express.json());

// General rate limit on all API routes
app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);

// DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo Connected"))
  .catch((err) => {
    console.error("Mongo connection error:", err);
    process.exit(1);
  });

// Socket.IO init
const io = new Server(server, {
  cors: {
    origin: allowedOrigins.length > 0 ? allowedOrigins : "*",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true
  }
});

// Socket.IO handlers
io.on("connection", (socket) => {
  socket.on("joinPlaceRoom", (placeId) => {
    socket.join(placeId);
  });
  socket.on("disconnect", () => { });
});

// Queue routes (needs io for broadcasting)
const queueRoutes = queueRoutesFactory(io);
app.use("/api", queueRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
