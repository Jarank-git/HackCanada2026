import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PetForm from '../components/upload/PetForm';
import PhotoDropZone from '../components/upload/PhotoDropZone';
import StepIndicator from '../components/upload/StepIndicator';
import { useUploadFlow } from '../hooks/useUploadFlow';
import { useCaption } from '../hooks/useCaption';
import { generatePetId } from '../utils/petId';
import { savePetCaption } from '../api/cloudinaryProxy';
import type { PetFormData, UploadedAsset } from '../types/pet';

const INITIAL_FORM: PetFormData = {
  name: '',
  species: '',
  breed: '',
  age: '',
  sex: '',
  temperament: [],
  shelterName: '',
  shelterContact: '',
  shelterLocation: '',
};

const STEPS = ['Pet Details', 'Upload Photos', 'Review & Submit'];

export default function UploadPage() {
  const navigate = useNavigate();

  const petId = useMemo(() => generatePetId(), []);

  const [formData, setFormData] = useState<PetFormData>(INITIAL_FORM);
  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [editedCaption, setEditedCaption] = useState('');

  const { submit, isSubmitting, error } = useUploadFlow(petId, formData, assets);
  const { caption, loading: captionLoading, error: captionError, generate: generateCaption } = useCaption(formData);

  const handleGenerateCaption = async () => {
    setEditedCaption('');
    await generateCaption();
  };

  const uploadMetadata = useMemo(() => {
    const md: Record<string, string> = {
      pawprint_pet_id: petId,
    };
    if (formData.name) md.pawprint_pet_name = formData.name;
    if (formData.species) md.pawprint_species = formData.species;
    if (formData.breed) md.pawprint_breed = formData.breed;
    if (formData.age) md.pawprint_age = formData.age;
    if (formData.sex) md.pawprint_sex = formData.sex;
    if (formData.temperament.length > 0) {
      md.pawprint_temperament = formData.temperament.join(',');
    }
    if (formData.shelterName) md.pawprint_shelter_name = formData.shelterName;
    if (formData.shelterContact) md.pawprint_shelter_contact = formData.shelterContact;
    if (formData.shelterLocation) md.pawprint_shelter_location = formData.shelterLocation;
    return md;
  }, [petId, formData]);

  const uploadFolder = `pawprint/pets/${petId}`;

  const handleAddAsset = useCallback((asset: UploadedAsset) => {
    setAssets((prev) => [...prev, asset]);
  }, []);

  const handleRemoveAsset = useCallback((publicId: string) => {
    setAssets((prev) => prev.filter((a) => a.publicId !== publicId));
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

      navigate(`/pet/${id}`);
    } catch {
      // error is already set in the hook
    }
  }

  // Pick hero photo (highest quality score, fallback to first)
  const heroAsset = useMemo(() => {
    if (assets.length === 0) return null;
    const scored = assets.filter((a) => a.qualityScore !== null);
    if (scored.length > 0) {
      return scored.reduce((best, a) => (a.qualityScore! > best.qualityScore! ? a : best));
    }
    return assets[0];
  }, [assets]);

  const currentCaption = editedCaption || caption || '';

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
              <PhotoDropZone
                assets={assets}
                onUpload={handleAddAsset}
                onRemove={handleRemoveAsset}
                folder={uploadFolder}
                metadata={uploadMetadata}
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
                      src={heroAsset.secureUrl}
                      alt={formData.name}
                      className="review-hero-img"
                    />
                    <span className="review-hero-badge">Hero Photo</span>
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
                  <p className="review-photo-count">{assets.length} photo{assets.length !== 1 ? 's' : ''} uploaded</p>
                </div>
              </div>

              <div className="preview-caption-section">
                <div className="preview-caption-header">
                  <span className="section-label">AI Caption</span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleGenerateCaption}
                    disabled={captionLoading}
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
                  <div className="upload-error" style={{ marginBottom: '0.75rem' }}>{captionError}</div>
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
          <div className="upload-error">{error}</div>
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
              disabled={isSubmitting}
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
