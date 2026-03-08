import type { UploadedAsset } from '../types/pet';

export interface EnhancementDetail {
  icon: 'sun' | 'palette' | 'contrast' | 'focus';
  label: string;
  description: string;
}

export interface ImageAnalysis {
  heroReasoning: string;
  enhancements: EnhancementDetail[];
  overallNote: string;
}

export interface AIImageAnalysis {
  heroSuitability: string;
  enhancements: EnhancementDetail[];
  overallNote: string;
  suggestedTransformations: string[];
}

/**
 * Generate per-image enhancement reasoning based on quality score.
 * Cloudinary's `improve()` auto-adjusts lighting, color balance, and contrast.
 * The focus score (0–1) tells us about image sharpness.
 */
export function analyzeImage(
  asset: UploadedAsset,
  allAssets: UploadedAsset[],
  heroPublicId: string | null,
): ImageAnalysis {
  const score = asset.qualityScore;
  const isHero = asset.publicId === heroPublicId;

  // Enhancement details based on quality score ranges
  const enhancements: EnhancementDetail[] = [];

  if (score === null) {
    enhancements.push(
      { icon: 'sun', label: 'Lighting balanced', description: 'Exposure and brightness auto-adjusted for even lighting' },
      { icon: 'palette', label: 'Colors enhanced', description: 'Saturation and white balance tuned for natural tones' },
      { icon: 'contrast', label: 'Contrast optimized', description: 'Shadow and highlight detail recovered' },
    );
  } else if (score >= 0.7) {
    enhancements.push(
      { icon: 'focus', label: 'Sharp & well-focused', description: 'Minimal correction needed — image is already crisp' },
      { icon: 'sun', label: 'Slight lighting polish', description: 'Fine exposure adjustment to bring out details' },
      { icon: 'palette', label: 'Colors preserved', description: 'Natural color accuracy maintained with subtle vibrancy boost' },
    );
  } else if (score >= 0.4) {
    enhancements.push(
      { icon: 'sun', label: 'Lighting corrected', description: 'Underexposed/overexposed areas rebalanced for clarity' },
      { icon: 'palette', label: 'Color boost applied', description: 'Warmth and saturation improved to make the pet stand out' },
      { icon: 'contrast', label: 'Contrast enhanced', description: 'Added definition between subject and background' },
    );
  } else {
    enhancements.push(
      { icon: 'sun', label: 'Heavy lighting correction', description: 'Significant exposure adjustment applied — original was too dark or washed out' },
      { icon: 'palette', label: 'Color recovery attempted', description: 'Color grading applied to salvage muted or off-white tones' },
      { icon: 'contrast', label: 'Contrast boosted', description: 'Aggressive contrast to improve visibility despite blur' },
      { icon: 'focus', label: 'Softness detected', description: 'Image has noticeable blur — sharpening helps but a retake would be ideal' },
    );
  }

  // Hero reasoning
  let heroReasoning: string;
  if (isHero) {
    const scored = allAssets.filter((a) => a.qualityScore !== null);
    if (scored.length > 1) {
      heroReasoning = `Selected as hero photo — highest focus score (${score !== null ? Math.round(score * 100) : '?'}%) of all ${allAssets.length} uploads. This is the sharpest, most visually striking image and will be the first thing adopters see.`;
    } else if (scored.length === 1) {
      heroReasoning = `Selected as hero photo — this is the clearest image with a focus score of ${score !== null ? Math.round(score * 100) : '?'}%. It will be the first thing adopters see on the profile and social cards.`;
    } else {
      heroReasoning = 'Selected as hero photo — first uploaded image. Upload more photos so PawPrint can auto-select the sharpest one.';
    }
  } else {
    if (score !== null && score >= 0.7) {
      heroReasoning = `Strong image (${Math.round(score * 100)}% focus) — great for the gallery carousel. Close in quality to the hero.`;
    } else if (score !== null && score >= 0.4) {
      heroReasoning = `Decent quality (${Math.round(score * 100)}% focus) — good for gallery variety, but not sharp enough for hero.`;
    } else if (score !== null) {
      heroReasoning = `Lower quality (${Math.round(score * 100)}% focus) — consider retaking this photo with better lighting or a steadier hand.`;
    } else {
      heroReasoning = 'Quality data unavailable — included in gallery for variety.';
    }
  }

  // Overall note
  let overallNote: string;
  if (score === null) {
    overallNote = 'Standard enhancements applied. Quality analysis was not available for this image.';
  } else if (score >= 0.7) {
    overallNote = 'Excellent photo! Only minor polish applied — your original was already high quality.';
  } else if (score >= 0.4) {
    overallNote = 'Good photo with moderate enhancements. Lighting and color were improved to make it more eye-catching on social media.';
  } else {
    overallNote = 'This photo needed significant correction. For best results, consider retaking in natural light with a steady hand.';
  }

  return { heroReasoning, enhancements, overallNote };
}

export interface PhotoSuggestion {
  icon: 'camera' | 'sun' | 'heart' | 'move' | 'users';
  title: string;
  description: string;
}

/**
 * Generate suggestions for additional photos based on what's been uploaded.
 */
export function getPhotoSuggestions(assets: UploadedAsset[]): PhotoSuggestion[] {
  const suggestions: PhotoSuggestion[] = [];
  const count = assets.length;
  const avgScore =
    assets.filter((a) => a.qualityScore !== null).reduce((sum, a) => sum + a.qualityScore!, 0) /
    Math.max(assets.filter((a) => a.qualityScore !== null).length, 1);

  if (count === 1) {
    suggestions.push(
      { icon: 'camera', title: 'Add a close-up face shot', description: 'Close-ups showing eyes and expression get 2x more engagement on Instagram and Facebook.' },
      { icon: 'move', title: 'Add a full-body photo', description: 'Adopters want to see the full pet — size, coat, and posture help them connect.' },
      { icon: 'heart', title: 'Show personality in action', description: 'A photo of the pet playing, cuddling, or being silly tells a story words cannot.' },
    );
  } else if (count <= 3) {
    suggestions.push(
      { icon: 'sun', title: 'Try an outdoor shot', description: 'Natural light photos look more vibrant on social media and show the pet in a lively setting.' },
      { icon: 'heart', title: 'Capture a candid moment', description: 'Unposed, natural moments (yawning, tilting head) generate the most shares.' },
    );
  } else if (count <= 5) {
    suggestions.push(
      { icon: 'users', title: 'Add a people interaction photo', description: 'Photos with a human hand, lap, or volunteer show the pet is social and adoptable.' },
    );
  }

  if (avgScore < 0.5 && count > 0) {
    suggestions.push(
      { icon: 'sun', title: 'Improve lighting conditions', description: 'Your photos scored below average on clarity. Try shooting near a window or outdoors for sharper, brighter images.' },
    );
  }

  if (count >= 6) {
    suggestions.push(
      { icon: 'camera', title: 'Great coverage!', description: 'You have plenty of photos. Focus on quality over quantity — remove any blurry or duplicate shots.' },
    );
  }

  return suggestions;
}
