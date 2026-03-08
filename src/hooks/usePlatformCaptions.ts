import { useState, useCallback } from 'react';
import { generatePlatformCaptionsForPet, type PlatformCaptions } from '../api/gemini';
import type { Pet } from '../types/pet';

interface UsePlatformCaptionsResult {
  captions: PlatformCaptions | null;
  loading: boolean;
  error: string | null;
  generate: () => Promise<void>;
}

export function usePlatformCaptions(pet: Pet | null): UsePlatformCaptionsResult {
  const [captions, setCaptions] = useState<PlatformCaptions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    if (!pet) return;
    setLoading(true);
    setError(null);

    try {
      const result = await generatePlatformCaptionsForPet({
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        age: pet.age,
        sex: pet.sex,
        temperament: pet.temperament,
        vaccination: pet.vaccination,
        spayedNeutered: pet.spayedNeutered,
        shelterName: pet.shelterName,
        shelterContact: pet.shelterContact,
        shelterLocation: pet.shelterLocation,
      });
      setCaptions(result);
    } catch (err) {
      console.error('Platform caption generation failed:', err);
      setError('Could not generate platform captions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [pet]);

  return { captions, loading, error, generate };
}
