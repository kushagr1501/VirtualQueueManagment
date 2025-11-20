


import express from "express";
import Queue from "../models/Queue.js";
import Place from "../models/Place.js";

const router = express.Router();

export default (io) => {
  // Get queue for a specific place - FIXED: Remove this duplicate route
  // router.get("/place/:placeId", async (req, res) => {
  //   const queue = await Queue.find({ placeId: req.params.placeId, status: "waiting" });
  //   res.json(queue);
  // });
  
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

  function generateRandomCode() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  }

  // Join queue
  router.post("/place/:placeId/join", async (req, res) => {
    const { userName, queueName = "default" } = req.body;
  
    // prevent duplicate entry in the same queue
    const existingEntry = await Queue.findOne({
      userName,
      placeId: req.params.placeId,
      queueName,
      status: "waiting",
    });
  
    if (existingEntry) {
      return res.status(409).json({ message: "Already joined this queue", _id: existingEntry._id, verificationCode: existingEntry.verificationCode });
    }
  
    const entry = new Queue({
      userName,
      placeId: req.params.placeId,
      queueName,
      verificationCode: generateRandomCode()
    });
  
    await entry.save();
  
    const updatedQueue = await Queue.find({
      placeId: req.params.placeId,
      status: "waiting",
      queueName
    });
  
    io.to(req.params.placeId).emit("queueUpdate", updatedQueue);
    res.status(201).json(entry);
  });
  
  // Leave queue

// Leave queue (user voluntarily leaves) — sets cancelledAt
router.post("/leave/:id", async (req, res) => {
  try {
    const queueEntry = await Queue.findById(req.params.id);
    if (!queueEntry) {
      return res.status(404).json({ message: "Queue entry not found" });
    }

    const updated = await Queue.findByIdAndUpdate(
      req.params.id,
      { $set: { status: "cancelled", cancelledAt: new Date() } },
      { new: true }
    );

    // Emit update with the specific queue name (waiting list only)
    const updatedQueue = await Queue.find({
      placeId: queueEntry.placeId,
      status: "waiting",
      queueName: queueEntry.queueName
    });

    io.to(queueEntry.placeId.toString()).emit("queueUpdate", updatedQueue);
    res.json({ message: "Left queue", entry: updated });
  } catch (err) {
    console.error("Error leaving queue:", err);
    res.status(500).json({ message: "Failed to leave queue" });
  }
});


 // Serve user (admin only) — sets servedAt
router.patch("/serve/:id", async (req, res) => {
  try {
    const updated = await Queue.findByIdAndUpdate(
      req.params.id,
      { $set: { status: "served", servedAt: new Date() } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Entry not found" });

    // Get updated waiting queue for that queueName/place
    const queue = await Queue.find({
      placeId: updated.placeId,
      status: "waiting",
      queueName: updated.queueName
    });

    io.to(updated.placeId.toString()).emit("queueUpdate", queue);
    res.json(updated);
  } catch (err) {
    console.error("Error serving user:", err);
    res.status(500).json({ message: "Failed to serve user" });
  }
});

  
  // Add new place
  router.post("/places", async (req, res) => {
    const { name, description, location, businessId } = req.body;
  
    if (!name || !description || !location || !businessId) {
      return res.status(400).json({ message: "Missing required fields" });
    }
  
    const place = new Place({ name, description, location, businessId });
    await place.save();
    res.status(201).json(place);
  });


  
router.delete("/queue/delete-queue/:placeId/:queueName", async (req, res) => {
  const { placeId, queueName } = req.params;

  try {
    // 1. Mark all waiting users as served
    await Queue.updateMany(
      {
        placeId,
        queueName,
        status: "waiting"
      },
      { $set: { status: "served" } }
    );

    // 2. Delete the system placeholder row for this queue
    await Queue.deleteOne({
      placeId,
      queueName
    });

    // // 3. Return remaining queues for UI
    // const remainingQueueNames = await Queue.distinct("queueName", {
    //   placeId,
    //   userName: { $ne: "__system__" }
    // });

    // 4. Emit updated data to clients
    const remaining = await Queue.find({ placeId, status: "waiting" });
    io.to(placeId).emit("queueUpdate", remaining);

    res.json({
      message: `Queue '${queueName}' deleted successfully`,
      queueNames: remainingQueueNames,
    });
  } catch (error) {
    console.error("Error deleting queue:", error);
    res.status(500).json({ error: "Failed to delete queue" });
  }
});

  
 


  // Get all places or places by businessId
  router.get("/places", async (req, res) => {
    const { businessId } = req.query;
    const filter = businessId ? { businessId } : {};

    const places = await Place.find(filter);

    // for each place, fetch queue count across all queues
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
  });

// User acknowledges they were served (client voluntary action)
router.post("/queue/:id/acknowledge", async (req, res) => {
  try {
    const entry = await Queue.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    // Only acknowledge if it was served (optional: also allow other statuses)
    if (entry.status !== "served") {
      return res.status(400).json({ message: "Only served entries can be acknowledged" });
    }

    const updated = await Queue.findByIdAndUpdate(
      req.params.id,
      { $set: { acknowledgedAt: new Date() } },
      { new: true }
    );

    // Optionally emit an update — clients mostly care about waiting list
    const updatedQueue = await Queue.find({
      placeId: entry.placeId,
      status: "waiting",
      queueName: entry.queueName
    });

    io.to(entry.placeId.toString()).emit("queueUpdate", updatedQueue);

    res.json({ message: "Acknowledged", entry: updated });
  } catch (err) {
    console.error("Error acknowledging entry:", err);
    res.status(500).json({ message: "Failed to acknowledge entry" });
  }
});

  
  // Find queue entry by verification code
  router.get("/queue/find-by-code/:code", async (req, res) => {
    const entry = await Queue.findOne({ verificationCode: req.params.code });

    if (!entry) return res.status(404).json({ message: "Queue entry not found" });

    res.json(entry);
  });

  // Verify a queue entry
  router.patch("/queue/:id/verify", async (req, res) => {
    const updated = await Queue.findByIdAndUpdate(
      req.params.id,
      {
        isVerified: true,
        verifiedAt: new Date()
      },
      { new: true }
    );

    // Emit update with the specific queue
    const updatedQueue = await Queue.find({
      placeId: updated.placeId,
      status: "waiting",
      queueName: updated.queueName
    });

    io.to(updated.placeId.toString()).emit("queueUpdate", updatedQueue);
    res.json(updated);
  });

  // Get multiple queue entries by verification codes
  router.post("/queues/by-codes", async (req, res) => {
    const { codes } = req.body;
    if (!codes || !Array.isArray(codes)) {
      return res.status(400).json({ message: "Codes array required" });
    }

    try {
      const queues = await Queue.find({
        verificationCode: { $in: codes },
        status: "waiting"
      });
      res.json(queues);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch queues", error: err.message });
    }
  });

  // Get queue entries for a place with filter by queueName
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
      console.error("Error fetching queue:", err);
      res.status(500).json({ message: "Failed to fetch queue" });
    }
  });

  // Create a new named queue under a place
  router.post("/places/:placeId/queues", async (req, res) => {
    const { queueName } = req.body;

    if (!queueName || typeof queueName !== "string") {
      return res.status(400).json({ message: "Queue name is required" });
    }

    try {
      const existing = await Queue.findOne({
        placeId: req.params.placeId,
        queueName,
      });

      if (existing) {
        return res.status(400).json({ message: "Queue already exists" });
      }

      // Insert a dummy entry to register the queue name
      await new Queue({
        placeId: req.params.placeId,
        queueName,
        userName: "__system__",
        status: "placeholder",
        verificationCode: "__none__",
      }).save();

      res.status(201).json({ message: "Queue created" });
    } catch (err) {
      console.error("Queue creation failed:", err);
      res.status(500).json({ message: "Queue creation failed" });
    }
  });
  
  // Return list of distinct queue names for a place
  router.get("/places/:placeId/queues", async (req, res) => {
    try {
      const queueNames = await Queue.distinct("queueName", {
        placeId: req.params.placeId,
      });
      
      // Filter out system placeholder if it exists
      const filteredQueueNames = queueNames.filter(name => name !== "__system__");
      
      res.json(filteredQueueNames);
    } catch (err) {
      console.error("Failed to fetch queue names:", err);
      res.status(500).json({ message: "Error fetching queue names" });
    }
  });

  return router;

};







