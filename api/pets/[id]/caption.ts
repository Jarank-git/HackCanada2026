import type { VercelRequest, VercelResponse } from '@vercel/node';
import cloudinary from '../../_lib/cloudinary.js';
import type { CloudinarySearchResult } from '../../_lib/pets.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Pet ID is required' });
    }

    const { caption } = req.body;
    if (!caption || typeof caption !== 'string') {
      return res.status(400).json({ error: 'caption is required' });
    }

    const result: CloudinarySearchResult = await cloudinary.search
      .expression(`folder:pawprint/pets/* AND metadata.pawprint_pet_id=${id}`)
      .with_field('metadata')
      .max_results(30)
      .execute();

    if (result.resources.length === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    await Promise.all(
      result.resources.map((r) =>
        cloudinary.uploader.explicit(r.public_id, {
          type: 'upload',
          metadata: `pawprint_caption=${caption}`,
        }),
      ),
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Failed to save caption:', err);
    res.status(500).json({ error: 'Failed to save caption' });
  }
}
