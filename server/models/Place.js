import mongoose from "mongoose";
import Business from "./Business.js";

const PlaceSchema = new mongoose.Schema({
  name: String,
  description: String,
  location: String,
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business" },
  category: {
    type: String,
    enum: ["restaurant", "retail", "hospital", "government", "other"],
    default: "other"
  }
});


export default mongoose.model("Place", PlaceSchema);
