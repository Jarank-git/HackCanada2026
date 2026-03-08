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
    const result: CloudinarySearchResult = await cloudinary.search
      .expression('folder:pawprint/pets/*')
      .with_field('metadata')
      .with_field('tags')
      .sort_by('created_at', 'desc')
      .max_results(30)
      .execute();

    const pets = groupToPets(result.resources);
    res.json(pets);
  } catch (err) {
    console.error('Failed to fetch pets:', err);
    res.status(500).json({ error: 'Failed to fetch pets' });
  }
}
