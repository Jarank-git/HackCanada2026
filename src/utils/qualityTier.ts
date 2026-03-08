export interface QualityTier {
  tier: 'best' | 'good' | 'poor';
  label: string;
  cssClass: string;
}

export function getQualityTier(score: number | null): QualityTier {
  if (score === null) {
    return { tier: 'good', label: 'Good', cssClass: 'gold' };
  }
  if (score >= 0.7) {
    return { tier: 'best', label: 'Best', cssClass: 'teal' };
  }
  if (score >= 0.4) {
    return { tier: 'good', label: 'Good', cssClass: 'gold' };
  }
  return { tier: 'poor', label: 'Poor', cssClass: 'coral' };
}

export function getQualityPercent(score: number | null): number {
  if (score === null) return 50;
  return Math.round(score * 100);
}
