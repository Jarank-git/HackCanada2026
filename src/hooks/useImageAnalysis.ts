import { useState, useCallback, useRef } from 'react';
import { analyzeImageForPet } from '../api/gemini';
import type { PetFormData, UploadedAsset } from '../types/pet';
import type { AIImageAnalysis } from '../utils/photoAnalysis';

interface PerImageState {
  loading: boolean;
  error: string | null;
  analysis: AIImageAnalysis | null;
}

interface UseImageAnalysisResult {
  results: Record<string, PerImageState>;
  analyzeAll: () => Promise<void>;
  analyzeOne: (publicId: string) => Promise<void>;
  isAnalyzing: boolean;
}

const CONCURRENCY = 3;

export function useImageAnalysis(
  assets: UploadedAsset[],
  petData: PetFormData,
  heroPublicId: string | null,
): UseImageAnalysisResult {
  const [results, setResults] = useState<Record<string, PerImageState>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const abortRef = useRef(false);

  const analyzeOne = useCallback(async (publicId: string) => {
    const asset = assets.find((a) => a.publicId === publicId);
    if (!asset) return;

    const idx = assets.indexOf(asset);

    setResults((prev) => ({
      ...prev,
      [publicId]: { loading: true, error: null, analysis: prev[publicId]?.analysis ?? null },
    }));

    try {
      const analysis = await analyzeImageForPet(asset.secureUrl, petData, {
        isHero: publicId === heroPublicId,
        qualityScore: asset.qualityScore,
        totalImages: assets.length,
        imageIndex: idx + 1,
      });

      setResults((prev) => ({
        ...prev,
        [publicId]: { loading: false, error: null, analysis },
      }));
    } catch (err) {
      setResults((prev) => ({
        ...prev,
        [publicId]: {
          loading: false,
          error: err instanceof Error ? err.message : 'Analysis failed',
          analysis: prev[publicId]?.analysis ?? null,
        },
      }));
    }
  }, [assets, petData, heroPublicId]);

  const analyzeAll = useCallback(async () => {
    abortRef.current = false;
    setIsAnalyzing(true);

    // Only analyze images that don't already have a cached result
    const toAnalyze = assets.filter((a) => !results[a.publicId]?.analysis);

    // Process in batches of CONCURRENCY
    for (let i = 0; i < toAnalyze.length; i += CONCURRENCY) {
      if (abortRef.current) break;

      const batch = toAnalyze.slice(i, i + CONCURRENCY);
      const promises = batch.map((asset) => {
        const idx = assets.indexOf(asset);

        setResults((prev) => ({
          ...prev,
          [asset.publicId]: { loading: true, error: null, analysis: prev[asset.publicId]?.analysis ?? null },
        }));

        return analyzeImageForPet(asset.secureUrl, petData, {
          isHero: asset.publicId === heroPublicId,
          qualityScore: asset.qualityScore,
          totalImages: assets.length,
          imageIndex: idx + 1,
        }).then(
          (analysis) => ({ publicId: asset.publicId, analysis, error: null }),
          (err) => ({ publicId: asset.publicId, analysis: null, error: err instanceof Error ? err.message : 'Analysis failed' }),
        );
      });

      const settled = await Promise.allSettled(promises);

      for (const result of settled) {
        if (result.status === 'fulfilled') {
          const { publicId, analysis, error } = result.value;
          setResults((prev) => ({
            ...prev,
            [publicId]: { loading: false, error, analysis: analysis ?? prev[publicId]?.analysis ?? null },
          }));
        }
      }
    }

    setIsAnalyzing(false);
  }, [assets, petData, heroPublicId, results]);

  return { results, analyzeAll, analyzeOne, isAnalyzing };
}
