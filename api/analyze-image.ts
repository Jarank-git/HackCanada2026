import type { VercelRequest, VercelResponse } from '@vercel/node';
import { analyzeImageWithGemini } from './_lib/gemini.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageUrl, petName, species, breed, isHero, qualityScore, totalImages, imageIndex } = req.body;

    if (!imageUrl || typeof imageUrl !== 'string') {
      return res.status(400).json({ error: 'imageUrl is required' });
    }

    // Prevent open proxy abuse — only allow Cloudinary URLs
    if (!imageUrl.startsWith('https://res.cloudinary.com/')) {
      return res.status(400).json({ error: 'imageUrl must be a Cloudinary URL' });
    }

    const analysis = await analyzeImageWithGemini(
      imageUrl,
      { name: petName || 'Unknown', species: species || 'pet', breed: breed || '' },
      {
        isHero: !!isHero,
        qualityScore: qualityScore ?? null,
        totalImages: totalImages || 1,
        imageIndex: imageIndex || 1,
      },
    );

    res.json({ analysis });
  } catch (err) {
    console.error('Image analysis failed:', err);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
}
