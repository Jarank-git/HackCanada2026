import { useState, useEffect, useCallback } from 'react';
import type { Pet } from '../types/pet';
import { fetchPets } from '../api/cloudinaryProxy';

interface UsePetsResult {
  pets: Pet[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function usePets(): UsePetsResult {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPets();
      setPets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { pets, loading, error, refresh: load };
}
