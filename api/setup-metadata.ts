import type { VercelRequest, VercelResponse } from '@vercel/node';
import cloudinary from './_lib/cloudinary.js';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const fields = [
    {
      external_id: 'pawprint_vaccination',
      label: 'Vaccination Status',
      type: 'string',
      mandatory: false,
    },
    {
      external_id: 'pawprint_spayed_neutered',
      label: 'Spayed / Neutered',
      type: 'string',
      mandatory: false,
    },
  ];

  const results: string[] = [];

  for (const field of fields) {
    try {
      await cloudinary.api.add_metadata_field(field);
      results.push(`Created: ${field.external_id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      if (message.includes('already exists')) {
        results.push(`Exists: ${field.external_id} (skipped)`);
      } else {
        results.push(`FAILED: ${field.external_id} — ${message}`);
      }
    }
  }

  return res.status(200).json({ results });
}
