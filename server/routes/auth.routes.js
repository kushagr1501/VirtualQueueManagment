import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Place from "../models/Place.js";
import Business from "../models/Business.js"; 

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { name, email, password, companyName, description, location, category } = req.body;

  if (!name || !email || !password || !companyName || !location) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existing = await Business.findOne({ email });
  if (existing) return res.status(400).json({ message: "Business already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newBusiness = await Business.create({ name, email, password: hashedPassword });

  const newPlace = await Place.create({
    name: companyName,
    description: description || `Welcome to ${companyName}`,
    location,
    businessId: newBusiness._id,
    category: category || "other"
  });

  const token = jwt.sign({ businessId: newBusiness._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

  res.status(201).json({
    message: "Signup and place created",
    token,
    businessId: newBusiness._id,
    placeId: newPlace._id
  });
});

 router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const business = await Business.findOne({ email });
  if (!business) return res.status(404).json({ message: "Business not found" });

  const valid = await bcrypt.compare(password, business.password);
  if (!valid) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ businessId: business._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

  res.status(200).json({ token, businessId: business._id });
});

export default router;
