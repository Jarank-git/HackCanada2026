import type { VercelRequest, VercelResponse } from '@vercel/node';
import cloudinary from '../../_lib/cloudinary.js';
import type { CloudinarySearchResult } from '../../_lib/pets.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Pet ID is required' });
    }

    // Find all images belonging to this pet
    const result: CloudinarySearchResult = await cloudinary.search
      .expression(`folder:pawprint/pets/* AND metadata.pawprint_pet_id=${id}`)
      .max_results(100)
      .execute();

    if (result.resources.length === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    // Delete all images
    const publicIds = result.resources.map((r) => r.public_id);
    await cloudinary.api.delete_resources(publicIds);

    // Try to remove the folder (will fail silently if not empty)
    try {
      await cloudinary.api.delete_folder(`pawprint/pets/${id}`);
    } catch {
      // Folder may not exist or may not be empty — safe to ignore
    }

    res.json({ deleted: publicIds.length });
  } catch (err) {
    console.error('Failed to delete pet:', err);
    res.status(500).json({ error: 'Failed to delete pet campaign' });
  }
}
