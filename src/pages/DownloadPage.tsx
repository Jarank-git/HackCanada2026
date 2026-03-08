import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePet } from '../hooks/usePet';
import { useDownloadPack } from '../hooks/useDownloadPack';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { PLATFORMS } from '../types/platform';
import type { PlatformKey } from '../types/platform';
import CaptionCard from '../components/campaign/CaptionCard';
import PlatformPack from '../components/campaign/PlatformPack';
import SocialPreview from '../components/campaign/SocialPreview';
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

export default function DownloadPage() {
  const { id } = useParams<{ id: string }>();
  const { pet, loading, error, isNotFound, refresh } = usePet(id);
  const { downloadPlatform, downloadAll, progress, isGenerating, error: downloadError, skippedCount } = useDownloadPack(pet);
  const [previewPlatform, setPreviewPlatform] = useState<PlatformKey | null>(null);
  const online = useOnlineStatus();

  /* ── Loading skeleton ──────────────────────── */
  if (loading) {
    return (
      <div className="page download-page">
        <div className="page-header">
          <div className="skeleton-line skeleton-line--title" style={{ width: '50%', marginBottom: '0.75rem' }} />
          <div className="skeleton-line" style={{ width: '35%' }} />
        </div>
        <div className="skeleton-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div className="skeleton-line" style={{ width: '90%', marginBottom: '0.5rem' }} />
          <div className="skeleton-line" style={{ width: '70%' }} />
        </div>
        <div className="download-grid">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton-card" style={{ height: 280 }} />
          ))}
        </div>
      </div>
    );
  }

  /* ── 404 not found ──────────────────────────── */
  if (isNotFound) {
    return (
      <div className="page download-page">
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
      <div className="page download-page">
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

  return (
    <div className="page download-page">
      {/* Header */}
      <div className="page-header">
        <h1>{pet.name} &mdash; Campaign Pack</h1>
        <p>Platform-optimized images and captions, ready to share.</p>
      </div>

      {/* Download error */}
      {downloadError && (
        <div style={{ marginBottom: '1.5rem' }}>
          <ErrorBanner message={downloadError} />
        </div>
      )}

      {/* Skipped images warning */}
      {skippedCount > 0 && !downloadError && (
        <div style={{ marginBottom: '1.5rem' }}>
          <ErrorBanner
            message={`${skippedCount} image${skippedCount > 1 ? 's' : ''} couldn't be downloaded and ${skippedCount > 1 ? 'were' : 'was'} skipped.`}
          />
        </div>
      )}

      {/* Progress bar */}
      {isGenerating && (
        <div className="progress-bar-wrapper">
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-bar-label">Generating ZIP &mdash; {progress}%</span>
        </div>
      )}

      {/* Caption card */}
      <CaptionCard caption={pet.caption} petName={pet.name} />

      {/* Platform grid */}
      <h2 className="pet-section-title" style={{ marginTop: '2.5rem' }}>Platform Packs</h2>
      <div className="download-grid">
        {PLATFORMS.map((platform) => (
          <PlatformPack
            key={platform.key}
            pet={pet}
            platform={platform}
            onDownload={() => downloadPlatform(platform.key)}
            isGenerating={isGenerating || !online}
          />
        ))}
      </div>

      {/* Social preview */}
      <div className="social-preview-section">
        <h2 className="pet-section-title">Post Preview</h2>
        <div className="social-preview-tabs">
          {PLATFORMS.map((p) => (
            <button
              key={p.key}
              type="button"
              className={`social-preview-tab ${previewPlatform === p.key ? 'social-preview-tab--active' : ''}`}
              onClick={() => setPreviewPlatform(previewPlatform === p.key ? null : p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>
        {previewPlatform && <SocialPreview pet={pet} platform={previewPlatform} />}
      </div>

      {/* QR Code + Kennel Card */}
      <div className="download-extras">
        <div className="download-extras-col">
          <h2 className="pet-section-title">QR Code</h2>
          <QRCodeCard petId={pet.id} petName={pet.name} />
        </div>
        <div className="download-extras-col">
          <h2 className="pet-section-title">Kennel Card</h2>
          <KennelCard pet={pet} />
        </div>
      </div>

      {/* Download all + back link */}
      <div className="download-actions">
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={downloadAll}
          disabled={isGenerating || !online}
        >
          {isGenerating ? (
            <span className="upload-spinner">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Generating...
            </span>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download All Platforms
            </>
          )}
        </button>
        <Link to={`/pet/${pet.id}`} className="btn btn-outline">
          Back to Profile
        </Link>
      </div>
    </div>
  );
}
