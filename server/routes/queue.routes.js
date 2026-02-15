import express from "express";
import mongoose from "mongoose";
import Queue from "../models/Queue.js";
import Place from "../models/Place.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { validate, joinQueueSchema, addPlaceSchema, verifyTokenSchema, createQueueSchema, updatePlaceSchema } from "../middleware/validate.js";
import { queueJoinLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

export default (io) => {

  const broadcastQueueUpdate = async (placeId, queueName) => {
    try {
      console.log(`Broadcasting update for place: ${placeId}, queue: ${queueName}`);
      const updatedQueue = await Queue.find({
        placeId,
        status: "waiting",
        queueName
      });

      io.to(placeId.toString()).emit("queueUpdate", {
        queueName,
        data: updatedQueue
      });
      console.log(`Emitted queueUpdate to room ${placeId} with ${updatedQueue.length} items`);
    } catch (err) {
      console.error("Broadcast error:", err);
    }
  };

  function generateRandomCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
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

  // Add new place (protected)
  router.post("/places", authenticateToken, validate(addPlaceSchema), async (req, res) => {
    const { name, description, location, category } = req.body;
    const place = new Place({ name, description, location, businessId: req.businessId, category: category || "other" });
    await place.save();
    res.status(201).json(place);
  });

  // Update place (protected)
  router.put("/places/:id", authenticateToken, validate(updatePlaceSchema), async (req, res) => {
    try {
      const place = await Place.findOne({ _id: req.params.id, businessId: req.businessId });
      if (!place) return res.status(404).json({ message: "Place not found or unauthorized" });

      const updates = req.body;
      Object.keys(updates).forEach((key) => {
        if (updates[key] !== undefined) {
          place[key] = updates[key];
        }
      });

      await place.save();
      res.json(place);
    } catch (err) {
      res.status(500).json({ message: "Failed to update place", error: err.message });
    }
  });

  // Delete a place (protected)
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

  // Join queue (rate limited + validated)
  router.post("/place/:placeId/join", queueJoinLimiter, validate(joinQueueSchema), async (req, res) => {
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

  // User leaves queue (public)
  router.post("/queue/:id/leave", async (req, res) => {
    const { verificationCode } = req.body;
    try {
      const entry = await Queue.findById(req.params.id);
      if (!entry) return res.status(404).json({ message: "Ticket not found" });

      // Simple ownership check
      if (entry.verificationCode !== verificationCode) {
        return res.status(403).json({ message: "Unauthorized: Invalid verification code" });
      }

      const updated = await Queue.findByIdAndUpdate(
        req.params.id,
        { $set: { status: "cancelled", cancelledAt: new Date() } },
        { new: true }
      );

      await broadcastQueueUpdate(updated.placeId, updated.queueName);
      res.json({ message: "Left queue successfully", entry: updated });
    } catch (err) {
      console.error("Error leaving queue:", err);
      res.status(500).json({ message: "Failed to leave queue" });
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

  // Verify User
  router.post("/queue/verify-token", validate(verifyTokenSchema), async (req, res) => {
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
  router.post("/places/:placeId/queues", authenticateToken, validate(createQueueSchema), async (req, res) => {
    const { queueName } = req.body;

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
      await Queue.updateMany(
        { placeId, queueName, status: "waiting" },
        { $set: { status: "served", servedAt: new Date() } }
      );

      const deleteResult = await Queue.deleteMany({ placeId, queueName });

      const remainingQueueNames = await Queue.distinct("queueName", { placeId });
      const filteredQueueNames = remainingQueueNames.filter(name => name !== "__system__");

      await broadcastQueueUpdate(placeId, queueName);

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

  // --- ANALYTICS ---

  // Get analytics data for a place
  router.get("/places/:placeId/analytics", authenticateToken, async (req, res) => {
    try {
      const { placeId } = req.params;
      const days = parseInt(req.query.days) || 30;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // All completed entries in the date range
      const entries = await Queue.find({
        placeId,
        status: { $in: ["served", "cancelled"] },
        joinedAt: { $gte: since },
        userName: { $ne: "__system__" }
      }).lean();

      const served = entries.filter(e => e.status === "served");
      const cancelled = entries.filter(e => e.status === "cancelled");

      // Average wait time (joinedAt -> servedAt) in minutes
      const waitTimes = served
        .filter(e => e.servedAt)
        .map(e => (new Date(e.servedAt) - new Date(e.joinedAt)) / 60000);
      const avgWaitTime = waitTimes.length > 0
        ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length)
        : 0;

      // Completion rate
      const totalProcessed = served.length + cancelled.length;
      const completionRate = totalProcessed > 0
        ? Math.round((served.length / totalProcessed) * 100)
        : 0;

      // No-show rate (joined but never verified, among served+cancelled)
      const noShows = entries.filter(e => !e.isVerified).length;
      const noShowRate = totalProcessed > 0
        ? Math.round((noShows / totalProcessed) * 100)
        : 0;

      // Hourly distribution (0-23)
      const hourlyMap = {};
      for (let h = 0; h < 24; h++) hourlyMap[h] = 0;
      entries.forEach(e => {
        const hour = new Date(e.joinedAt).getHours();
        hourlyMap[hour]++;
      });
      const hourlyData = Object.keys(hourlyMap).map(h => ({ hour: parseInt(h), count: hourlyMap[h] }));

      // Peak hour
      const peakHour = hourlyData.reduce((max, h) => h.count > max.count ? h : max, { hour: 0, count: 0 }).hour;

      // Daily traffic
      const dailyMap = {};
      entries.forEach(e => {
        const dateKey = new Date(e.joinedAt).toISOString().split("T")[0];
        if (!dailyMap[dateKey]) dailyMap[dateKey] = { date: dateKey, served: 0, cancelled: 0 };
        if (e.status === "served") dailyMap[dateKey].served++;
        else dailyMap[dateKey].cancelled++;
      });
      const dailyData = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

      // Day of week breakdown
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const weekdayMap = dayNames.map(name => ({ name, count: 0 }));
      entries.forEach(e => {
        const day = new Date(e.joinedAt).getDay();
        weekdayMap[day].count++;
      });

      // Busiest day
      const busiestDay = weekdayMap.reduce((max, d) => d.count > max.count ? d : max, { name: "N/A", count: 0 }).name;

      // Per-queue breakdown
      const queueMap = {};
      entries.forEach(e => {
        const qn = e.queueName || "default";
        if (!queueMap[qn]) queueMap[qn] = { name: qn, served: 0, cancelled: 0 };
        if (e.status === "served") queueMap[qn].served++;
        else queueMap[qn].cancelled++;
      });
      const queueData = Object.values(queueMap);

      // Average serve rate (entries served per hour the place is active)
      const uniqueDays = new Set(entries.map(e => new Date(e.joinedAt).toISOString().split("T")[0]));
      const activeDays = uniqueDays.size || 1;
      const avgServedPerDay = Math.round(served.length / activeDays);

      res.json({
        summary: {
          totalServed: served.length,
          totalCancelled: cancelled.length,
          avgWaitTime,
          completionRate,
          noShowRate,
          peakHour,
          busiestDay,
          avgServedPerDay,
          totalProcessed
        },
        hourlyData,
        dailyData,
        queueData,
        weekdayData: weekdayMap
      });
    } catch (err) {
      console.error("Analytics error:", err);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Export analytics as CSV
  router.get("/places/:placeId/analytics/export", authenticateToken, async (req, res) => {
    try {
      const { placeId } = req.params;
      const days = parseInt(req.query.days) || 30;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const entries = await Queue.find({
        placeId,
        status: { $in: ["served", "cancelled"] },
        joinedAt: { $gte: since },
        userName: { $ne: "__system__" }
      }).sort({ joinedAt: -1 }).lean();

      // Build CSV
      const headers = ["User Name", "Queue", "Status", "Joined At", "Verified", "Served At", "Wait Time (min)"];
      const rows = entries.map(e => {
        const waitMin = e.servedAt
          ? Math.round((new Date(e.servedAt) - new Date(e.joinedAt)) / 60000)
          : "";
        return [
          `"${e.userName}"`,
          e.queueName || "default",
          e.status,
          new Date(e.joinedAt).toISOString(),
          e.isVerified ? "Yes" : "No",
          e.servedAt ? new Date(e.servedAt).toISOString() : "",
          waitMin
        ].join(",");
      });

      const csv = [headers.join(","), ...rows].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=analytics_${placeId}_${days}d.csv`);
      res.send(csv);
    } catch (err) {
      console.error("CSV export error:", err);
      res.status(500).json({ message: "Export failed" });
    }
  });

  return router;
};
