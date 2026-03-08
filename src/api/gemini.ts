import type { PetFormData } from '../types/pet';
import type { AIImageAnalysis } from '../utils/photoAnalysis';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function generateCaptionForPet(petData: PetFormData): Promise<string> {
  const res = await fetch(`${BASE_URL}/caption`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: petData.name,
      species: petData.species,
      breed: petData.breed,
      age: petData.age,
      sex: petData.sex,
      temperament: petData.temperament,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || 'Failed to generate caption');
  }

  const data = await res.json();
  return data.caption;
}

export interface PlatformCaption {
  caption: string;
  hashtags: string[];
}

export type PlatformCaptions = Record<string, PlatformCaption>;

export interface ImageAnalysisContext {
  isHero: boolean;
  qualityScore: number | null;
  totalImages: number;
  imageIndex: number;
}

export async function analyzeImageForPet(
  imageUrl: string,
  petData: PetFormData,
  context: ImageAnalysisContext,
): Promise<AIImageAnalysis> {
  const res = await fetch(`${BASE_URL}/analyze-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageUrl,
      petName: petData.name,
      species: petData.species,
      breed: petData.breed,
      isHero: context.isHero,
      qualityScore: context.qualityScore,
      totalImages: context.totalImages,
      imageIndex: context.imageIndex,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || 'Failed to analyze image');
  }

  const data = await res.json();
  return data.analysis;
}

export async function generatePlatformCaptionsForPet(petData: PetFormData): Promise<PlatformCaptions> {
  const res = await fetch(`${BASE_URL}/platform-captions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: petData.name,
      species: petData.species,
      breed: petData.breed,
      age: petData.age,
      sex: petData.sex,
      temperament: petData.temperament,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || 'Failed to generate platform captions');
  }

  const data = await res.json();
  return data.captions;
}
