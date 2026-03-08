import type { PetFormData } from '../types/pet';

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
