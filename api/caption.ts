import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateCaption } from './_lib/gemini.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    const message = err instanceof Error ? err.message : String(err);
    console.error('Caption generation failed:', message);
    res.status(500).json({ error: 'Failed to generate caption', detail: message });
  }
}
