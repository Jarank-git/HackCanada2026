import { Router } from "express";
import cloudinary from "../services/cloudinary.js";

const router = Router();

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  metadata?: Record<string, string | string[]>;
  tags?: string[];
}

interface CloudinarySearchResult {
  resources: CloudinaryResource[];
}

function groupToPets(resources: CloudinaryResource[]) {
  const groups = new Map<string, CloudinaryResource[]>();

  for (const r of resources) {
    const petId = r.metadata?.pawprint_pet_id as string | undefined;
    if (!petId) continue;
    if (!groups.has(petId)) groups.set(petId, []);
    groups.get(petId)!.push(r);
  }

  return Array.from(groups.entries()).map(([petId, assets]) => {
    const first = assets[0];
    const md = first.metadata || {};
    const heroAsset = assets.find((a) => a.tags?.includes("hero"));

    const temperament = md.pawprint_temperament;
    const tempArray = Array.isArray(temperament)
      ? temperament
      : typeof temperament === "string"
        ? temperament
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

    return {
      id: petId,
      name: (md.pawprint_pet_name as string) || "",
      species: (md.pawprint_species as string) || "",
      breed: (md.pawprint_breed as string) || "",
      age: (md.pawprint_age as string) || "",
      sex: (md.pawprint_sex as string) || "",
      heroUrl: heroAsset?.secure_url || undefined,
      temperament: tempArray,
      shelterName: (md.pawprint_shelter_name as string) || "",
      shelterContact: (md.pawprint_shelter_contact as string) || "",
      shelterLocation: (md.pawprint_shelter_location as string) || "",
      status: (md.pawprint_status as string) || "Available",
      caption: (md.pawprint_caption as string) || "",
      galleryUrls: assets.map((a) => a.secure_url),
      publicIds: assets.map((a) => a.public_id),
    };
  });
}

// GET /api/pets
router.get("/", async (_req, res) => {
  try {
    const result: CloudinarySearchResult = await cloudinary.search
      .expression("folder:pawprint/pets/* AND metadata.pawprint_pet_id:*")
      .with_field("metadata")
      .with_field("tags")
      .sort_by("created_at", "desc")
      .max_results(30)
      .execute();

    const pets = groupToPets(result.resources);
    res.json(pets);
  } catch (err) {
    console.error("Failed to fetch pets:", err);
    res.status(500).json({ error: "Failed to fetch pets" });
  }
});

// GET /api/pets/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result: CloudinarySearchResult = await cloudinary.search
      .expression(
        `folder:pawprint/pets/* AND metadata.pawprint_pet_id=${id}`,
      )
      .with_field("metadata")
      .with_field("tags")
      .sort_by("created_at", "desc")
      .max_results(30)
      .execute();

    const pets = groupToPets(result.resources);
    if (pets.length === 0) {
      res.status(404).json({ error: "Pet not found" });
      return;
    }
    res.json(pets[0]);
  } catch (err) {
    console.error("Failed to fetch pet:", err);
    res.status(500).json({ error: "Failed to fetch pet" });
  }
});

// POST /api/pets/:id/caption — save caption to Cloudinary metadata
router.post("/:id/caption", async (req, res) => {
  try {
    const { id } = req.params;
    const { caption } = req.body;

    if (!caption || typeof caption !== "string") {
      res.status(400).json({ error: "caption is required" });
      return;
    }

    // Find all assets for this pet
    const result: CloudinarySearchResult = await cloudinary.search
      .expression(
        `folder:pawprint/pets/* AND metadata.pawprint_pet_id=${id}`,
      )
      .with_field("metadata")
      .max_results(30)
      .execute();

    if (result.resources.length === 0) {
      res.status(404).json({ error: "Pet not found" });
      return;
    }

    // Update caption metadata on all assets
    await Promise.all(
      result.resources.map((r) =>
        cloudinary.uploader.explicit(r.public_id, {
          type: "upload",
          metadata: `pawprint_caption=${caption}`,
        }),
      ),
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Failed to save caption:", err);
    res.status(500).json({ error: "Failed to save caption" });
  }
});

export default router;
