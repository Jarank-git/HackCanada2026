import { useState, useCallback } from 'react';
import { generateCaptionForPet } from '../api/gemini';
import type { PetFormData } from '../types/pet';

interface UseCaptionResult {
  caption: string | null;
  loading: boolean;
  error: string | null;
  generate: () => Promise<void>;
}

export function useCaption(petData: PetFormData): UseCaptionResult {
  const [caption, setCaption] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await generateCaptionForPet(petData);
      setCaption(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate caption');
    } finally {
      setLoading(false);
    }
  }, [petData]);

  return { caption, loading, error, generate };
}
