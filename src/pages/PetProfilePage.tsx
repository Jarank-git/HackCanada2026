import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePet } from '../hooks/usePet';
import { generateCaptionForPet } from '../api/gemini';
import { savePetCaption } from '../api/cloudinaryProxy';
import PetHero from '../components/pet/PetHero';
import PetGallery from '../components/pet/PetGallery';
import PetDetails from '../components/pet/PetDetails';
import ShareButton from '../components/pet/ShareButton';
import QRCodeCard from '../components/campaign/QRCodeCard';
import KennelCard from '../components/campaign/KennelCard';
import ErrorBanner from '../components/ui/ErrorBanner';
import EmptyState from '../components/ui/EmptyState';

const PAW_ICON = (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.25 }}>
    <ellipse cx="6.5" cy="5" rx="2" ry="2.5" />
    <ellipse cx="17.5" cy="5" rx="2" ry="2.5" />
    <ellipse cx="3.5" cy="11" rx="1.8" ry="2.2" />
    <ellipse cx="20.5" cy="11" rx="1.8" ry="2.2" />
    <ellipse cx="12" cy="15.5" rx="4.5" ry="4" />
  </svg>
);

export default function PetProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { pet, loading, error, isNotFound, refresh } = usePet(id);

  const [caption, setCaption] = useState<string | null>(null);
  const [captionLoading, setCaptionLoading] = useState(false);
  const [captionError, setCaptionError] = useState<string | null>(null);

  const displayCaption = caption ?? pet?.caption ?? '';

  async function handleGenerateCaption() {
    if (!pet) return;
    setCaptionLoading(true);
    setCaptionError(null);

    try {
      const result = await generateCaptionForPet({
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        age: pet.age,
        sex: pet.sex,
        temperament: pet.temperament,
        shelterName: pet.shelterName,
        shelterContact: pet.shelterContact,
        shelterLocation: pet.shelterLocation,
      });
      setCaption(result);

      // Save the caption to Cloudinary metadata
      await savePetCaption(pet.id, result).catch((err) =>
        console.error('Failed to save caption:', err),
      );
    } catch (err) {
      console.error('Caption generation failed:', err);
      setCaptionError('Caption unavailable. Please try again.');
    } finally {
      setCaptionLoading(false);
    }
  }

  /* ── Loading skeleton ──────────────────────── */
  if (loading) {
    return (
      <div className="page pet-profile-page">
        <div className="skeleton-hero">
          <div className="skeleton-image" style={{ aspectRatio: '4/3', maxHeight: 500, borderRadius: 'var(--radius-lg)' }} />
        </div>
        <div className="pet-profile-layout" style={{ marginTop: '2rem' }}>
          <div className="pet-profile-main">
            <div className="skeleton-card" style={{ padding: '2rem' }}>
              <div className="skeleton-line skeleton-line--title" style={{ width: '40%', marginBottom: '1rem' }} />
              <div className="skeleton-line" style={{ width: '90%', marginBottom: '0.5rem' }} />
              <div className="skeleton-line" style={{ width: '75%', marginBottom: '0.5rem' }} />
              <div className="skeleton-line" style={{ width: '60%' }} />
            </div>
          </div>
          <div className="pet-sidebar">
            <div className="skeleton-card" style={{ padding: '1.5rem' }}>
              <div className="skeleton-line" style={{ width: '80%', marginBottom: '0.75rem' }} />
              <div className="skeleton-line" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── 404 not found ──────────────────────────── */
  if (isNotFound) {
    return (
      <div className="page pet-profile-page">
        <EmptyState
          icon={PAW_ICON}
          title="Pet not found"
          description="This pet may have been removed or the link is incorrect."
          action={{ label: 'Back to Gallery', to: '/gallery' }}
        />
      </div>
    );
  }

  /* ── Network/other error ────────────────────── */
  if (error || !pet) {
    return (
      <div className="page pet-profile-page">
        <ErrorBanner
          message={error || 'Something went wrong. Please try again.'}
          onRetry={refresh}
        />
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/gallery" className="btn btn-outline">Back to Gallery</Link>
        </div>
      </div>
    );
  }

  const heroPublicId = pet.publicIds[0] ?? '';

  return (
    <div className="page pet-profile-page">
      {/* Hero */}
      {heroPublicId && <PetHero publicId={heroPublicId} petName={pet.name} />}

      {/* Two-column layout */}
      <div className="pet-profile-layout">
        {/* Main column */}
        <div className="pet-profile-main">
          <PetDetails pet={pet} />

          {/* AI caption */}
          {displayCaption ? (
            <blockquote className="pet-caption">
              <span className="section-label">AI-Generated Caption</span>
              <p>{displayCaption}</p>
            </blockquote>
          ) : (
            <div className="pet-caption-generate">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleGenerateCaption}
                disabled={captionLoading}
              >
                {captionLoading ? (
                  <span className="upload-spinner">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Generating Caption...
                  </span>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                    Generate AI Caption
                  </>
                )}
              </button>
              {captionError && (
                <div style={{ marginTop: '0.75rem' }}>
                  <ErrorBanner message={captionError} onRetry={handleGenerateCaption} />
                </div>
              )}
            </div>
          )}

          {/* Gallery */}
          {pet.publicIds.length > 1 && (
            <div className="pet-gallery-section">
              <h2 className="pet-section-title">Photos</h2>
              <PetGallery publicIds={pet.publicIds} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="pet-sidebar">
          <div className="pet-sidebar-card">
            <ShareButton petId={pet.id} />

            <QRCodeCard petId={pet.id} petName={pet.name} />

            <KennelCard pet={pet} />

            <Link to={`/pet/${pet.id}/download`} className="btn btn-primary" style={{ width: '100%' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Campaign Pack
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
