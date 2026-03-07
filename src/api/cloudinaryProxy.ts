import type { Pet } from '../types/pet';

const BASE_URL = 'http://localhost:3001/api';

export interface SignResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
}

export async function signUpload(
  folder: string,
  metadata: Record<string, string>,
): Promise<SignResponse> {
  const res = await fetch(`${BASE_URL}/sign-upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder, metadata }),
  });
  if (!res.ok) throw new Error('Failed to sign upload');
  return res.json();
}

export async function tagHero(publicId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/tag-hero`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicId }),
  });
  if (!res.ok) throw new Error('Failed to tag hero image');
}

export async function fetchPets(): Promise<Pet[]> {
  const res = await fetch(`${BASE_URL}/pets`);
  if (!res.ok) throw new Error('Failed to fetch pets');
  return res.json();
}

export async function fetchPet(petId: string): Promise<Pet | null> {
  const res = await fetch(`${BASE_URL}/pets/${encodeURIComponent(petId)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch pet');
  return res.json();
}

export async function savePetCaption(petId: string, caption: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/pets/${encodeURIComponent(petId)}/caption`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caption }),
  });
  if (!res.ok) throw new Error('Failed to save caption');
}
