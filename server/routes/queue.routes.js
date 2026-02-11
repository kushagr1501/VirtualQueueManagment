import express from "express";
import mongoose from "mongoose";
import Queue from "../models/Queue.js";
import Place from "../models/Place.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

export default (io) => {

  // Helper: Broadcast queue updates via Socket.IO
  const broadcastQueueUpdate = async (placeId, queueName) => {
    try {
      const updatedQueue = await Queue.find({
        placeId,
        status: "waiting",
        queueName
      });
      io.to(placeId.toString()).emit("queueUpdate", updatedQueue);
    } catch (err) {
      // Silent fail on broadcast error
    }
  };

  function generateRandomCode() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  }

  // --- PLACES ---

  // Get a specific place by ID
  router.get("/places/:id", async (req, res) => {
    try {
      const place = await Place.findById(req.params.id);
      if (!place) return res.status(404).json({ message: "Place not found" });
      res.json(place);
    } catch (err) {
      res.status(500).json({ message: "Error fetching place", error: err.message });
    }
  });

  // Get all places (with optional filtering)
  router.get("/places", async (req, res) => {
    try {
      const { businessId, category } = req.query;
      const filter = {};
      if (businessId) {
        filter.businessId = new mongoose.Types.ObjectId(businessId);
      }
      if (category) filter.category = category;

      const places = await Place.find(filter);

      const placesWithQueueCount = await Promise.all(
        places.map(async (place) => {
          const queueCount = await Queue.countDocuments({
            placeId: place._id,
            status: "waiting",
          });
          return { ...place.toObject(), queueCount };
        })
      );

      res.json(placesWithQueueCount);
    } catch (err) {
      console.error("Error fetching places:", err);
      res.status(500).json({ message: "Failed to fetch places", error: err.message });
    }
  });

  // Add new place (protected - admin only)
  router.post("/places", authenticateToken, async (req, res) => {
    const { name, description, location, category } = req.body;
    if (!name || !description || !location) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const place = new Place({ name, description, location, businessId: req.businessId, category: category || "other" });
    await place.save();
    res.status(201).json(place);
  });

  // Delete a place (protected - admin only)
  router.delete("/places/:id", authenticateToken, async (req, res) => {
    try {
      const place = await Place.findById(req.params.id);
      if (!place) return res.status(404).json({ message: "Place not found" });

      await Queue.deleteMany({ placeId: req.params.id });
      await Place.findByIdAndDelete(req.params.id);

      res.json({ message: "Place and all queue entries deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete place" });
    }
  });


  // --- QUEUE MANAGEMENT ---

  // Join queue
  router.post("/place/:placeId/join", async (req, res) => {
    const { userName, queueName = "default" } = req.body;
    const { placeId } = req.params;

    const existingEntry = await Queue.findOne({
      userName,
      placeId,
      queueName,
      status: "waiting",
    });

    if (existingEntry) {
      return res.status(409).json({ message: "Already joined this queue", _id: existingEntry._id, verificationCode: existingEntry.verificationCode });
    }

    const entry = new Queue({
      userName,
      placeId,
      queueName,
      verificationCode: generateRandomCode()
    });

    await entry.save();

    // Broadcast
    await broadcastQueueUpdate(placeId, queueName);

    res.status(201).json(entry);
  });

  // Remove user from queue (admin only)
  router.post("/leave/:id", authenticateToken, async (req, res) => {
    try {
      const updated = await Queue.findByIdAndUpdate(
        req.params.id,
        { $set: { status: "cancelled", cancelledAt: new Date() } },
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: "Queue entry not found" });

      await broadcastQueueUpdate(updated.placeId, updated.queueName);

      res.json({ message: "Removed from queue", entry: updated });
    } catch (err) {
      res.status(500).json({ message: "Failed to remove from queue" });
    }
  });

  // Serve user (admin only)
  router.patch("/serve/:id", authenticateToken, async (req, res) => {
    try {
      const updated = await Queue.findByIdAndUpdate(
        req.params.id,
        { $set: { status: "served", servedAt: new Date() } },
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: "Entry not found" });

      await broadcastQueueUpdate(updated.placeId, updated.queueName);

      res.json(updated);
    } catch (err) {
      console.error("Error serving user:", err);
      res.status(500).json({ message: "Failed to serve user" });
    }
  });

  // Verify User (One-Step)
  router.post("/queue/verify-token", async (req, res) => {
    const { placeId, verificationCode } = req.body;
    try {
      const user = await Queue.findOne({ placeId, verificationCode, status: "waiting" });

      if (!user) return res.status(404).json({ message: "Invalid code or user not found" });
      if (user.isVerified) return res.status(400).json({ message: "User is already verified", user });

      user.isVerified = true;
      user.verifiedAt = new Date();
      await user.save();

      await broadcastQueueUpdate(placeId, user.queueName);

      res.json({ message: "Verified successfully", user });
    } catch (err) {
      console.error("Verification error:", err);
      res.status(500).json({ message: "Server error during verification" });
    }
  });

  // User Acknowledges Served
  router.post("/queue/:id/acknowledge", async (req, res) => {
    try {
      const entry = await Queue.findById(req.params.id);
      if (!entry) return res.status(404).json({ message: "Entry not found" });
      if (entry.status !== "served") return res.status(400).json({ message: "Only served entries can be acknowledged" });

      const updated = await Queue.findByIdAndUpdate(
        req.params.id,
        { $set: { acknowledgedAt: new Date() } },
        { new: true }
      );

      await broadcastQueueUpdate(updated.placeId, updated.queueName);

      res.json({ message: "Acknowledged", entry: updated });
    } catch (err) {
      console.error("Error acknowledging entry:", err);
      res.status(500).json({ message: "Failed to acknowledge entry" });
    }
  });

  // --- QUEUE CONFIGURATION ---

  // Get queues list for a place
  router.get("/place/:placeId", async (req, res) => {
    try {
      const queueName = req.query.queueName || "default";
      const queue = await Queue.find({
        placeId: req.params.placeId,
        status: "waiting",
        queueName
      });
      res.json(queue);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch queue" });
    }
  });

  // Create named queue (admin only)
  router.post("/places/:placeId/queues", authenticateToken, async (req, res) => {
    const { queueName } = req.body;
    if (!queueName || typeof queueName !== "string") return res.status(400).json({ message: "Queue name is required" });

    try {
      const existing = await Queue.findOne({ placeId: req.params.placeId, queueName });
      if (existing) return res.status(400).json({ message: "Queue already exists" });

      await new Queue({
        placeId: req.params.placeId,
        queueName,
        userName: "__system__",
        status: "placeholder",
        verificationCode: "__none__",
      }).save();

      await broadcastQueueUpdate(req.params.placeId, queueName);

      res.status(201).json({ message: "Queue created" });
    } catch (err) {
      res.status(500).json({ message: "Queue creation failed" });
    }
  });

  // Delete named queue (admin only)
  router.delete("/queue/delete-queue/:placeId/:queueName", authenticateToken, async (req, res) => {
    const { placeId, queueName } = req.params;
    try {
      // Mark waiting as served (don't leave them hanging)
      await Queue.updateMany(
        { placeId, queueName, status: "waiting" },
        { $set: { status: "served", servedAt: new Date() } }
      );

      // Delete (including placeholder)
      const deleteResult = await Queue.deleteMany({ placeId, queueName });

      // Return remaining queues list
      const remainingQueueNames = await Queue.distinct("queueName", { placeId });
      const filteredQueueNames = remainingQueueNames.filter(name => name !== "__system__");

      // Broadcast remaining waiting list (likely empty for this queue, but updating state)
      // Actually we should broadcast that this specific queue is gone? 
      // The client usually re-fetches queue list on deletion.
      // But we can trigger an update for safety on the generic place room:
      await broadcastQueueUpdate(placeId, queueName); // Will return empty list, which is correct

      res.json({
        message: `Queue '${queueName}' deleted`,
        queueNames: filteredQueueNames,
        deletedCount: deleteResult.deletedCount
      });
    } catch (error) {
      console.error("Error deleting queue:", error);
      res.status(500).json({ error: "Failed to delete queue" });
    }
  });

  // Get distinct queue names
  router.get("/places/:placeId/queues", async (req, res) => {
    try {
      const queueNames = await Queue.distinct("queueName", { placeId: req.params.placeId });
      const filteredQueueNames = queueNames.filter(name => name !== "__system__");
      res.json(filteredQueueNames);
    } catch (err) {
      res.status(500).json({ message: "Error fetching queue names" });
    }
  });

  // Check user status by ticket ID
  router.get("/queue/status/:ticketId", async (req, res) => {
    try {
      const entry = await Queue.findById(req.params.ticketId);
      if (!entry) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.json({ 
        status: entry.status, 
        userName: entry.userName,
        placeId: entry.placeId,
        queueName: entry.queueName 
      });
    } catch (err) {
      res.status(500).json({ message: "Error checking status" });
    }
  });

  return router;
};
