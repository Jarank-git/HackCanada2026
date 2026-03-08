import { Router } from "express";
import { generatePhotoTips } from "../services/gemini.js";

const router = Router();

// POST /api/photo-tips
router.post("/", async (req, res) => {
  try {
    const { imageUrl, petName, species, breed, totalUploaded, avgQuality } =
      req.body;

    if (!imageUrl || typeof imageUrl !== "string") {
      res.status(400).json({ error: "imageUrl is required" });
      return;
    }

    if (!imageUrl.startsWith("https://res.cloudinary.com/")) {
      res.status(400).json({ error: "imageUrl must be a Cloudinary URL" });
      return;
    }

    const tips = await generatePhotoTips(
      imageUrl,
      {
        name: petName || "Unknown",
        species: species || "pet",
        breed: breed || "",
      },
      {
        totalUploaded: totalUploaded || 1,
        avgQuality: avgQuality || 0,
      },
    );

    res.json({ tips });
  } catch (err) {
    console.error("Photo tips generation failed:", err);
    res.status(500).json({ error: "Failed to generate photo tips" });
  }
});

export default router;
