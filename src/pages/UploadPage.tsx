import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PetForm from '../components/upload/PetForm';
import PhotoDropZone from '../components/upload/PhotoDropZone';
import StepIndicator from '../components/upload/StepIndicator';
import { useUploadFlow } from '../hooks/useUploadFlow';
import { useCaption } from '../hooks/useCaption';
import { useImageAnalysis } from '../hooks/useImageAnalysis';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { generatePetId } from '../utils/petId';
import { getQualityTier, getQualityPercent } from '../utils/qualityTier';
import { analyzeImage } from '../utils/photoAnalysis';
import { savePetCaption, savePetTemperament } from '../api/cloudinaryProxy';
import { getPhotoTipsForImage, type PhotoTip } from '../api/gemini';
import { assetHeroUrl, assetAnalysisUrl } from '../cloudinary/transformations';
import ErrorBanner from '../components/ui/ErrorBanner';
import type { PetFormData, UploadedAsset } from '../types/pet';

const INITIAL_FORM: PetFormData = {
  name: '',
  species: '',
  breed: '',
  age: '',
  sex: '',
  temperament: [],
  vaccination: '',
  spayedNeutered: '',
  shelterName: '',
  shelterContact: '',
  shelterLocation: '',
};

const STEPS = ['Pet Details', 'Upload Photos', 'Review & Submit'];

export default function UploadPage() {
  const navigate = useNavigate();
  const online = useOnlineStatus();

  const petId = useMemo(() => generatePetId(), []);

  const [formData, setFormData] = useState<PetFormData>(INITIAL_FORM);
  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [editedCaption, setEditedCaption] = useState('');
  const [manualHeroId, setManualHeroId] = useState<string | null>(null);
  const [aiTips, setAiTips] = useState<PhotoTip[] | null>(null);
  const [aiTipsLoading, setAiTipsLoading] = useState(false);

  // Pick hero photo: manual override first, then highest quality score, fallback to first
  const heroAsset = useMemo(() => {
    if (assets.length === 0) return null;
    if (manualHeroId) {
      const manual = assets.find((a) => a.publicId === manualHeroId);
      if (manual) return manual;
    }
    const scored = assets.filter((a) => a.qualityScore !== null);
    if (scored.length > 0) {
      return scored.reduce((best, a) => (a.qualityScore! > best.qualityScore! ? a : best));
    }
    return assets[0];
  }, [assets, manualHeroId]);

  const { submit, isSubmitting, error } = useUploadFlow(petId, formData, assets, heroAsset?.publicId);
  const { caption, loading: captionLoading, error: captionError, generate: generateCaption } = useCaption(formData);
  const { results: aiResults, analyzeAll, analyzeOne, isAnalyzing } = useImageAnalysis(assets, formData, heroAsset?.publicId ?? null);

  const handleGenerateCaption = async () => {
    setEditedCaption('');
    await generateCaption();
  };

  const uploadMetadata = useMemo(() => {
    const md: Record<string, string> = {
      pawprint_pet_id: petId,
    };
    if (formData.name) md.pawprint_pet_name = formData.name;
    if (formData.species) md.pawprint_species = formData.species.toLowerCase().replace(/\s+/g, '_');
    if (formData.breed) md.pawprint_breed = formData.breed;
    if (formData.age) md.pawprint_age = formData.age;
    if (formData.sex) md.pawprint_sex = formData.sex.toLowerCase().replace(/\s+/g, '_');
    if (formData.vaccination) md.pawprint_vaccination = formData.vaccination;
    if (formData.spayedNeutered) md.pawprint_spayed_neutered = formData.spayedNeutered;
    if (formData.shelterName) md.pawprint_shelter_name = formData.shelterName;
    if (formData.shelterContact) md.pawprint_shelter_contact = formData.shelterContact;
    if (formData.shelterLocation) md.pawprint_shelter_location = formData.shelterLocation;
    return md;
  }, [petId, formData]);

  const uploadFolder = `pawprint/pets/${petId}`;

  const handleAddAsset = useCallback((asset: UploadedAsset) => {
    setAssets((prev) => {
      const updated = [...prev, asset];

      // Trigger AI tips for the newly uploaded image
      setAiTipsLoading(true);
      const scored = updated.filter((a) => a.qualityScore !== null);
      const avgQuality = scored.length > 0
        ? scored.reduce((sum, a) => sum + a.qualityScore!, 0) / scored.length
        : 0;

      const tipUrl = asset.resourceType === 'video'
        ? assetAnalysisUrl(asset.publicId, 'video', 600, 400)
        : asset.secureUrl;
      getPhotoTipsForImage(tipUrl, formData, {
        totalUploaded: updated.length,
        avgQuality,
      })
        .then((tips) => setAiTips(tips))
        .catch(() => setAiTips(null))
        .finally(() => setAiTipsLoading(false));

      return updated;
    });
  }, [formData]);

  const handleRemoveAsset = useCallback((publicId: string) => {
    setAssets((prev) => prev.filter((a) => a.publicId !== publicId));
    if (manualHeroId === publicId) {
      setManualHeroId(null);
    }
  }, [manualHeroId]);

  const handleSetHero = useCallback((publicId: string) => {
    setManualHeroId(publicId);
  }, []);

  // Validation per step
  const canAdvanceFromStep1 = formData.name.trim().length > 0;
  const canAdvanceFromStep2 = assets.length >= 1;

  function handleNext() {
    if (currentStep === 1 && !canAdvanceFromStep1) return;
    if (currentStep === 2 && !canAdvanceFromStep2) return;
    setCurrentStep((s) => Math.min(s + 1, 3));
  }

  function handleBack() {
    setCurrentStep((s) => Math.max(s - 1, 1));
  }

  async function handleSubmit() {
    if (assets.length === 0) return;

    try {
      const id = await submit();

      const finalCaption = editedCaption || caption || '';
      if (finalCaption) {
        await savePetCaption(id, finalCaption).catch((err) =>
          console.error('Failed to save caption:', err),
        );
      }

      if (formData.temperament.length > 0) {
        await savePetTemperament(id, formData.temperament).catch((err) =>
          console.error('Failed to save temperament:', err),
        );
      }

      navigate(`/pet/${id}`);
    } catch {
      // error is already set in the hook
    }
  }

  const currentCaption = editedCaption || caption || '';

  const heroTier = heroAsset ? getQualityTier(heroAsset.qualityScore) : null;
  const heroPercent = heroAsset ? getQualityPercent(heroAsset.qualityScore) : 0;

  return (
    <div className="page upload-page">
      <div className="page-header">
        <h1>Create a Campaign</h1>
        <p>
          Upload shelter photos and fill in pet details to generate a shareable adoption profile.
        </p>
      </div>

      <div className="wizard-container">
        <StepIndicator currentStep={currentStep} steps={STEPS} />

        {/* Step 1: Pet Details */}
        <div className={`wizard-step${currentStep === 1 ? ' wizard-step--active' : ''}`}>
          {currentStep === 1 && (
            <>
              <h2 className="upload-section-title">Pet Details</h2>
              <PetForm value={formData} onChange={setFormData} />
            </>
          )}
        </div>

        {/* Step 2: Upload Photos */}
        <div className={`wizard-step${currentStep === 2 ? ' wizard-step--active' : ''}`}>
          {currentStep === 2 && (
            <>
              <h2 className="upload-section-title">Upload Photos</h2>
              {!online && (
                <div style={{ marginBottom: '1rem' }}>
                  <ErrorBanner message="You're offline. Photo uploads require an internet connection." />
                </div>
              )}
              <PhotoDropZone
                assets={assets}
                onUpload={handleAddAsset}
                onRemove={handleRemoveAsset}
                folder={uploadFolder}
                metadata={uploadMetadata}
                heroPublicId={heroAsset?.publicId ?? null}
                onSetHero={handleSetHero}
                aiTips={aiTips}
                aiTipsLoading={aiTipsLoading}
              />
            </>
          )}
        </div>

        {/* Step 3: Review & Submit */}
        <div className={`wizard-step${currentStep === 3 ? ' wizard-step--active' : ''}`}>
          {currentStep === 3 && (
            <>
              <div className="review-preview">
                {heroAsset && (
                  <div className="review-hero-wrap">
                    <img
                      src={assetHeroUrl(heroAsset.publicId, heroAsset.resourceType)}
                      alt={formData.name}
                      className="review-hero-img"
                    />
                    <span className="review-hero-badge">{heroAsset.resourceType === 'video' ? 'Hero Video' : 'Hero Photo'}</span>
                    {heroTier && (
                      <span className={`review-quality-badge review-quality-badge--${heroTier.cssClass}`}>
                        {heroTier.label} Quality &middot; {heroPercent}%
                      </span>
                    )}
                    <span className="review-enhanced-badge">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" />
                      </svg>
                      Enhanced
                    </span>
                  </div>
                )}

                <div className="review-details">
                  <h2 className="review-name">{formData.name}</h2>
                  <p className="preview-meta">
                    {formData.species}
                    {formData.breed && ` \u00B7 ${formData.breed}`}
                    {formData.age && ` \u00B7 ${formData.age}`}
                    {formData.sex && ` \u00B7 ${formData.sex}`}
                  </p>
                  {formData.temperament.length > 0 && (
                    <div className="preview-tags">
                      {formData.temperament.map((t) => (
                        <span key={t} className="preview-tag">{t}</span>
                      ))}
                    </div>
                  )}
                  {formData.shelterName && (
                    <p className="review-shelter">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                      {formData.shelterName}
                    </p>
                  )}
                  <p className="review-photo-count">
                    {assets.length} file{assets.length !== 1 ? 's' : ''} uploaded
                    {assets.some((a) => a.resourceType === 'video') && (
                      <> ({assets.filter((a) => a.resourceType === 'video').length} video{assets.filter((a) => a.resourceType === 'video').length !== 1 ? 's' : ''})</>
                    )}
                  </p>

                  {/* Quality summary bar chart */}
                  {assets.length > 0 && (
                    <div className="review-quality-summary">
                      <span className="review-quality-summary-label">Photo Quality</span>
                      <div className="review-quality-bars">
                        {assets.map((asset) => {
                          const tier = getQualityTier(asset.qualityScore);
                          const pct = getQualityPercent(asset.qualityScore);
                          const isHero = heroAsset?.publicId === asset.publicId;
                          return (
                            <div
                              key={asset.publicId}
                              className={`review-quality-bar review-quality-bar--${tier.cssClass}${isHero ? ' review-quality-bar--hero' : ''}`}
                              style={{ height: `${Math.max(pct, 10)}%` }}
                              title={`${isHero ? 'Hero · ' : ''}${tier.label} · ${pct}%`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Enhancement details */}
                  <div className="review-enhancements">
                    <span className="review-quality-summary-label">Auto-Enhancements Applied</span>
                    <ul className="review-enhancements-list">
                      <li>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                        <span><strong>Lighting &amp; exposure</strong> balanced automatically</span>
                      </li>
                      <li>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
                        <span><strong>Color vibrancy</strong> improved for social media</span>
                      </li>
                      <li>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                        <span><strong>High-quality output</strong> at 90% fidelity (no lossy compression)</span>
                      </li>
                      <li>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        <span><strong>Smart cropping</strong> focuses on your pet's face</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Per-image analysis cards */}
              {assets.length > 1 && (
                <div className="review-image-analysis">
                  <div className="review-image-analysis-header">
                    <h3 className="review-image-analysis-title">Per-Photo Analysis</h3>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={analyzeAll}
                      disabled={isAnalyzing || !online}
                      title={!online ? 'AI analysis requires an internet connection' : undefined}
                    >
                      {isAnalyzing ? (
                        <span className="upload-spinner">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                          </svg>
                          Analyzing...
                        </span>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" />
                          </svg>
                          Analyze All Photos with AI
                        </>
                      )}
                    </button>
                  </div>
                  <div className="review-image-analysis-grid">
                    {assets.map((asset, idx) => {
                      const heuristicAnalysis = analyzeImage(asset, assets, heroAsset?.publicId ?? null);
                      const aiState = aiResults[asset.publicId];
                      const hasAI = !!aiState?.analysis;
                      const aiLoading = !!aiState?.loading;
                      const aiError = aiState?.error ?? null;
                      const tier = getQualityTier(asset.qualityScore);
                      const pct = getQualityPercent(asset.qualityScore);
                      const isHero = heroAsset?.publicId === asset.publicId;

                      // Use AI analysis when available, fall back to heuristic
                      const reasoning = hasAI ? aiState.analysis!.heroSuitability : heuristicAnalysis.heroReasoning;
                      const enhancements = hasAI ? aiState.analysis!.enhancements : heuristicAnalysis.enhancements;
                      const note = hasAI ? aiState.analysis!.overallNote : heuristicAnalysis.overallNote;
                      const suggestions = hasAI ? aiState.analysis!.suggestedTransformations : [];

                      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dp498emx3';
                      const isVid = asset.resourceType === 'video';
                      const resPrefix = isVid ? 'video' : 'image';
                      const fmtSuffix = isVid ? 'f_jpg' : 'f_auto';
                      const beforeUrl = `https://res.cloudinary.com/${cloudName}/${resPrefix}/upload/c_fill,w_240,h_180,g_center/${fmtSuffix},q_auto/${asset.publicId}`;
                      const afterUrl = `https://res.cloudinary.com/${cloudName}/${resPrefix}/upload/c_fill,w_240,h_180,g_auto/e_improve/${fmtSuffix},q_90/${asset.publicId}`;

                      return (
                        <div key={asset.publicId} className={`review-image-card${isHero ? ' review-image-card--hero' : ''}${aiLoading ? ' review-image-card--loading' : ''}`}>
                          <div className="review-image-card-header">
                            <div className="review-image-card-meta">
                              <span className="review-image-card-label">
                                {asset.resourceType === 'video' ? 'Video' : 'Photo'} {idx + 1}
                                {isHero && <span className="review-image-card-hero-tag">Hero</span>}
                                {hasAI && <span className="review-image-card-ai-tag">AI Analyzed</span>}
                              </span>
                              <span className={`review-image-card-tier review-image-card-tier--${tier.cssClass}`}>
                                {tier.label} &middot; {pct}%
                              </span>
                            </div>
                          </div>

                          <div className="review-before-after">
                            <div className="review-before-after-pane">
                              <span className="review-before-after-label review-before-after-label--before">Before</span>
                              <img src={beforeUrl} alt="Original" className="review-before-after-img" />
                            </div>
                            <div className="review-before-after-arrow">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                              </svg>
                            </div>
                            <div className="review-before-after-pane">
                              <span className="review-before-after-label review-before-after-label--after">After</span>
                              <img src={afterUrl} alt="Enhanced" className="review-before-after-img" />
                            </div>
                          </div>

                          {aiLoading ? (
                            <div className="review-image-card-shimmer">
                              <div className="shimmer-line shimmer-line--long" />
                              <div className="shimmer-line shimmer-line--medium" />
                              <div className="shimmer-line shimmer-line--short" />
                              <div className="shimmer-line shimmer-line--long" />
                            </div>
                          ) : (
                            <>
                              <p className="review-image-card-reasoning">{reasoning}</p>
                              <ul className="review-image-card-edits">
                                {enhancements.map((e, i) => (
                                  <li key={i}>
                                    <strong>{e.label}:</strong> {e.description}
                                  </li>
                                ))}
                              </ul>
                              <p className="review-image-card-note">{note}</p>

                              {suggestions.length > 0 && (
                                <div className="review-image-card-suggestions">
                                  <span className="review-image-card-suggestions-label">Suggested Transformations</span>
                                  <ul>
                                    {suggestions.map((s, i) => (
                                      <li key={i}>{s}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {aiError && (
                                <div className="review-image-card-error">
                                  <span>AI analysis failed</span>
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-xs"
                                    onClick={() => analyzeOne(asset.publicId)}
                                  >
                                    Retry
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="preview-caption-section">
                <div className="preview-caption-header">
                  <span className="section-label">AI Caption</span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleGenerateCaption}
                    disabled={captionLoading || !online}
                  >
                    {captionLoading ? (
                      <span className="upload-spinner">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        Generating...
                      </span>
                    ) : currentCaption ? 'Regenerate Caption' : 'Generate Caption'}
                  </button>
                </div>

                {captionError && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <ErrorBanner message={captionError} onRetry={handleGenerateCaption} />
                  </div>
                )}

                <textarea
                  className="preview-caption-textarea"
                  value={currentCaption}
                  onChange={(e) => setEditedCaption(e.target.value)}
                  placeholder="Click 'Generate Caption' to create an AI-powered adoption caption, or write your own..."
                  rows={4}
                />
              </div>
            </>
          )}
        </div>

        {error && (
          <div style={{ marginTop: '1rem' }}>
            <ErrorBanner message={error} onRetry={handleSubmit} />
          </div>
        )}

        {/* Wizard navigation */}
        <div className="wizard-nav">
          <button
            type="button"
            className="btn btn-secondary btn-lg"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
            style={currentStep === 1 ? { visibility: 'hidden' } : undefined}
          >
            Back
          </button>

          {currentStep < 3 ? (
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !canAdvanceFromStep1) ||
                (currentStep === 2 && !canAdvanceFromStep2)
              }
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={handleSubmit}
              disabled={isSubmitting || !online}
            >
              {isSubmitting ? (
                <span className="upload-spinner">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Creating Campaign...
                </span>
              ) : (
                'Create Campaign'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
