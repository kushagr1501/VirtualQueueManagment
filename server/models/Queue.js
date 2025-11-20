import Place from "./Place.js";
import mongoose from "mongoose";

// const QueueSchema = new mongoose.Schema({
//   placeId: { type: mongoose.Schema.Types.ObjectId, ref: "Place" },
//   userName: String,
//   status: { type: String, default: "waiting" },
//   joinedAt: { type: Date, default: Date.now },

//   verificationCode: String,                      
//   isVerified: { type: Boolean, default: false }, 
//   queueName: { type: String, default: "default" },
//   verifiedAt: Date                             
// });

// export default mongoose.model("Queue", QueueSchema);


const QueueSchema = new mongoose.Schema({
  placeId: { type: mongoose.Schema.Types.ObjectId, ref: "Place" },
  userName: String,
  status: { type: String, default: "waiting" }, // waiting / served / cancelled / placeholder
  joinedAt: { type: Date, default: Date.now },

  verificationCode: String,
  isVerified: { type: Boolean, default: false },
  queueName: { type: String, default: "default" },
  verifiedAt: Date,

  // new timestamps
  servedAt: Date,
  servedReason: { type: String }, // e.g. "served_by_staff" | "queue_deleted" | null
  cancelledAt: Date,
  acknowledgedAt: Date
});

export default mongoose.model("Queue", QueueSchema);

