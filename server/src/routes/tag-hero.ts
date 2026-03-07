import { Router } from "express";
import cloudinary from "../services/cloudinary.js";

const router = Router();

// POST /api/tag-hero
router.post("/", async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId || typeof publicId !== "string") {
      res.status(400).json({ error: "publicId is required" });
      return;
    }

    await cloudinary.uploader.add_tag("hero", [publicId]);
    res.json({ success: true });
  } catch (err) {
    console.error("Failed to tag hero:", err);
    res.status(500).json({ error: "Failed to tag hero image" });
  }
});

export default router;
