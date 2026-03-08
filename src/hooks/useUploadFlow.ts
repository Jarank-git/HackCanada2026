import { useState } from 'react';
import { tagHero } from '../api/cloudinaryProxy';
import type { PetFormData, UploadedAsset } from '../types/pet';

interface UseUploadFlowResult {
  submit: () => Promise<string>;
  isSubmitting: boolean;
  error: string | null;
}

export function useUploadFlow(
  petId: string,
  _formData: PetFormData,
  assets: UploadedAsset[],
  heroPublicId?: string | null,
): UseUploadFlowResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(): Promise<string> {
    setIsSubmitting(true);
    setError(null);

    try {
      // Photos are already uploaded with metadata via the Upload Widget.
      // Use the manually selected hero if provided, otherwise pick highest qualityScore or first.
      let hero = heroPublicId
        ? assets.find((a) => a.publicId === heroPublicId) ?? null
        : null;

      if (!hero) {
        hero = assets.reduce((best, asset) => {
          if (best.qualityScore === null) return asset;
          if (asset.qualityScore === null) return best;
          return asset.qualityScore > best.qualityScore ? asset : best;
        }, assets[0]);
      }

      // Tag the hero image in Cloudinary
      if (hero) {
        await tagHero(hero.publicId);
      }

      // Return the pet ID so the page can navigate to /pet/:id
      return petId;
    } catch (err) {
      console.error('Upload submission failed:', err);
      const message = 'Something went wrong while creating your campaign. Please try again.';
      setError(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { submit, isSubmitting, error };
}
