import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generatePlatformCaptions } from './_lib/gemini.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    console.error('Platform caption generation failed:', err);
    res.status(500).json({ error: 'Failed to generate platform captions' });
  }
}
