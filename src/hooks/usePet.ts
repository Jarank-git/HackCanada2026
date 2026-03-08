import { useState, useEffect, useCallback } from 'react';
import type { Pet } from '../types/pet';
import { fetchPet } from '../api/cloudinaryProxy';

interface UsePetResult {
  pet: Pet | null;
  loading: boolean;
  error: string | null;
  isNotFound: boolean;
  refresh: () => void;
}

export function usePet(petId: string | undefined): UsePetResult {
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  const load = useCallback(() => {
    if (!petId) {
      setLoading(false);
      setError('No pet ID provided');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setIsNotFound(false);

    fetchPet(petId)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setIsNotFound(true);
          setError('Pet not found');
        } else {
          setPet(data);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to fetch pet:', err);
        setError('Something went wrong. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [petId]);

  useEffect(() => {
    const cleanup = load();
    return cleanup;
  }, [load]);

  return { pet, loading, error, isNotFound, refresh: load };
}
