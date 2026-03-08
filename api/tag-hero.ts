import type { VercelRequest, VercelResponse } from '@vercel/node';
import cloudinary from './_lib/cloudinary.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { publicId } = req.body;
    if (!publicId || typeof publicId !== 'string') {
      return res.status(400).json({ error: 'publicId is required' });
    }

    await cloudinary.uploader.add_tag('hero', [publicId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to tag hero:', err);
    res.status(500).json({ error: 'Failed to tag hero image' });
  }
}
