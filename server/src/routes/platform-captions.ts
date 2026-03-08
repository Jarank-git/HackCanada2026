import { Router } from "express";
import { generatePlatformCaptions } from "../services/gemini.js";

const router = Router();

// POST /api/platform-captions
router.post("/", async (req, res) => {
  try {
    const { name, species, breed, age, sex, temperament } = req.body;
    const captions = await generatePlatformCaptions({
      name,
      species,
      breed,
      age,
      sex,
      temperament: temperament || [],
    });
    res.json({ captions });
  } catch (err) {
    console.error("Platform caption generation failed:", err);
    res.status(500).json({ error: "Failed to generate platform captions" });
  }
});

export default router;
