import { Router } from "express";
import { generateCaption } from "../services/gemini.js";

const router = Router();

// POST /api/caption
router.post("/", async (req, res) => {
  try {
    const { name, species, breed, age, sex, temperament } = req.body;
    const caption = await generateCaption({
      name,
      species,
      breed,
      age,
      sex,
      temperament: temperament || [],
    });
    res.json({ caption });
  } catch (err) {
    console.error("Caption generation failed:", err);
    res
      .status(500)
      .json({ error: "Failed to generate caption" });
  }
});

export default router;
