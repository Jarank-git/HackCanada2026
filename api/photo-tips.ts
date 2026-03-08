import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generatePhotoTips } from './_lib/gemini.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageUrl, petName, species, breed, totalUploaded, avgQuality } = req.body;

    if (!imageUrl || typeof imageUrl !== 'string') {
      return res.status(400).json({ error: 'imageUrl is required' });
    }

    if (!imageUrl.startsWith('https://res.cloudinary.com/')) {
      return res.status(400).json({ error: 'imageUrl must be a Cloudinary URL' });
    }

    const tips = await generatePhotoTips(
      imageUrl,
      { name: petName || 'Unknown', species: species || 'pet', breed: breed || '' },
      { totalUploaded: totalUploaded || 1, avgQuality: avgQuality || 0 },
    );

    res.json({ tips });
  } catch (err) {
    console.error('Photo tips generation failed:', err);
    res.status(500).json({ error: 'Failed to generate photo tips' });
  }
}
