import mongoose from "mongoose";
import Business from "./Business.js";

const PlaceSchema = new mongoose.Schema({
  name: String,
  description: String,
  location: String,
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business" },

});


export default mongoose.model("Place", PlaceSchema);
