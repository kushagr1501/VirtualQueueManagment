import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Place from "../models/Place.js";
import Business from "../models/Business.js";
import RefreshToken from "../models/RefreshToken.js";
import { validate, signupSchema, loginSchema } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_DAYS = 30;

// Generate a short-lived access token
function generateAccessToken(businessId) {
  return jwt.sign({ businessId }, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

// Generate a cryptographically random refresh token and save to DB
async function generateRefreshToken(businessId) {
  const token = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

  await RefreshToken.create({ token, businessId, expiresAt });
  return token;
}

// --- Signup ---
router.post("/signup", authLimiter, validate(signupSchema), async (req, res) => {
  try {
    const { name, email, password, companyName, description, location, category } = req.body;

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

    const accessToken = generateAccessToken(newBusiness._id);
    const refreshToken = await generateRefreshToken(newBusiness._id);

    res.status(201).json({
      message: "Signup and place created",
      token: accessToken,
      refreshToken,
      businessId: newBusiness._id,
      placeId: newPlace._id
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Signup failed" });
  }
});

// --- Login ---
router.post("/login", authLimiter, validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const business = await Business.findOne({ email });
    if (!business) return res.status(404).json({ message: "Business not found" });

    const valid = await bcrypt.compare(password, business.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(business._id);
    const refreshToken = await generateRefreshToken(business._id);

    res.status(200).json({ token: accessToken, refreshToken, businessId: business._id });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

// --- Refresh Token ---
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: "Refresh token is required" });

  try {
    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    // Rotate: revoke old, issue new
    storedToken.isRevoked = true;
    await storedToken.save();

    const newAccessToken = generateAccessToken(storedToken.businessId);
    const newRefreshToken = await generateRefreshToken(storedToken.businessId);

    res.json({ token: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    console.error("Refresh error:", err);
    res.status(500).json({ message: "Token refresh failed" });
  }
});

// --- Logout (revoke refresh token) ---
router.post("/logout", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(200).json({ message: "Logged out" });

  try {
    await RefreshToken.findOneAndUpdate({ token: refreshToken }, { isRevoked: true });
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(200).json({ message: "Logged out" });
  }
});

export default router;
