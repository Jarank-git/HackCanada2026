import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePet } from '../hooks/usePet';
import { generateCaptionForPet } from '../api/gemini';
import { savePetCaption, deletePet } from '../api/cloudinaryProxy';
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
  const navigate = useNavigate();
  const { pet, loading, error, isNotFound, refresh } = usePet(id);

  const [caption, setCaption] = useState<string | null>(null);
  const [captionLoading, setCaptionLoading] = useState(false);
  const [captionError, setCaptionError] = useState<string | null>(null);
  const autoGenerateAttempted = useRef(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete() {
    if (!pet) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deletePet(pet.id);
      navigate('/gallery');
    } catch (err) {
      console.error('Delete failed:', err);
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete campaign');
      setDeleting(false);
    }
  }

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
        vaccination: pet.vaccination,
        spayedNeutered: pet.spayedNeutered,
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

  // Auto-generate caption if none exists when pet loads
  useEffect(() => {
    if (pet && !pet.caption && !caption && !autoGenerateAttempted.current) {
      autoGenerateAttempted.current = true;
      handleGenerateCaption();
    }
  }, [pet]);

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
  const heroResourceType = pet.resourceTypes?.[0] || 'image';

  return (
    <div className="page pet-profile-page">
      {/* Hero */}
      {heroPublicId && <PetHero publicId={heroPublicId} petName={pet.name} resourceType={heroResourceType} />}

      {/* Two-column layout */}
      <div className="pet-profile-layout">
        {/* Main column */}
        <div className="pet-profile-main">
          <PetDetails pet={pet} />

          {/* AI caption */}
          <div className="pet-caption-section">
            {captionLoading && !displayCaption ? (
              <blockquote className="pet-caption pet-caption--loading">
                <span className="section-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Generating Caption...
                </span>
                <div className="caption-shimmer">
                  <div className="shimmer-line shimmer-line--long" />
                  <div className="shimmer-line shimmer-line--medium" />
                  <div className="shimmer-line shimmer-line--short" />
                </div>
              </blockquote>
            ) : displayCaption ? (
              <blockquote className="pet-caption">
                <div className="pet-caption-header">
                  <span className="section-label">AI-Generated Caption</span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleGenerateCaption}
                    disabled={captionLoading}
                  >
                    {captionLoading ? (
                      <span className="upload-spinner">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        Regenerating...
                      </span>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 4v6h-6" />
                          <path d="M1 20v-6h6" />
                          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                        </svg>
                        Regenerate
                      </>
                    )}
                  </button>
                </div>
                <p>{displayCaption}</p>
              </blockquote>
            ) : (
              <blockquote className="pet-caption pet-caption--empty">
                <span className="section-label">AI-Generated Caption</span>
                <p className="pet-caption-placeholder">Caption could not be generated.</p>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleGenerateCaption}
                  disabled={captionLoading}
                >
                  Try Again
                </button>
              </blockquote>
            )}
            {captionError && (
              <div style={{ marginTop: '0.75rem' }}>
                <ErrorBanner message={captionError} onRetry={handleGenerateCaption} />
              </div>
            )}
          </div>

          {/* Gallery */}
          {pet.publicIds.length > 1 && (
            <div className="pet-gallery-section">
              <h2 className="pet-section-title">
                {pet.resourceTypes?.some((t) => t === 'video') ? 'Photos & Videos' : 'Photos'}
              </h2>
              <PetGallery publicIds={pet.publicIds} resourceTypes={pet.resourceTypes} />
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

            <button
              type="button"
              className="btn btn-danger-outline"
              style={{ width: '100%', marginTop: '0.75rem' }}
              onClick={() => setShowDeleteConfirm(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
              </svg>
              Delete Campaign
            </button>
          </div>
        </aside>

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div className="modal-overlay" onClick={() => !deleting && setShowDeleteConfirm(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-title">Delete Campaign</h3>
              <p className="modal-text">
                Are you sure you want to delete <strong>{pet.name}</strong>'s campaign? This will permanently remove all photos and data. This action cannot be undone.
              </p>
              {deleteError && (
                <div style={{ marginBottom: '1rem' }}>
                  <ErrorBanner message={deleteError} />
                </div>
              )}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <span className="upload-spinner">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      Deleting...
                    </span>
                  ) : 'Delete Forever'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
