import { useState, useEffect } from 'react';
import type { Pet } from '../types/pet';
import { fetchPet } from '../api/cloudinaryProxy';

interface UsePetResult {
  pet: Pet | null;
  loading: boolean;
  error: string | null;
}

export function usePet(petId: string | undefined): UsePetResult {
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!petId) {
      setLoading(false);
      setError('No pet ID provided');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchPet(petId)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setError('Pet not found');
        } else {
          setPet(data);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to fetch pet');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [petId]);

  return { pet, loading, error };
}
