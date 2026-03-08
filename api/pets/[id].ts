import type { VercelRequest, VercelResponse } from '@vercel/node';
import cloudinary from '../_lib/cloudinary.js';
import { groupToPets } from '../_lib/pets.js';
import type { CloudinarySearchResult } from '../_lib/pets.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Pet ID is required' });
    }

    const result: CloudinarySearchResult = await cloudinary.search
      .expression(`folder:pawprint/pets/* AND metadata.pawprint_pet_id=${id}`)
      .with_field('metadata')
      .with_field('tags')
      .sort_by('created_at', 'desc')
      .max_results(30)
      .execute();

    const pets = groupToPets(result.resources);
    if (pets.length === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    res.json(pets[0]);
  } catch (err) {
    console.error('Failed to fetch pet:', err);
    res.status(500).json({ error: 'Failed to fetch pet' });
  }
}
