import type { PlatformSpec } from '../../types/platform';
import type { Pet } from '../../types/pet';
import { platformUrl } from '../../cloudinary/transformations';

const PLATFORM_COLORS: Record<string, string> = {
  instagram_feed: '#E4405F',
  instagram_story: '#C13584',
  twitter: '#1DA1F2',
  facebook: '#1877F2',
  youtube_thumb: '#FF0000',
};

const PLATFORM_ICONS: Record<string, JSX.Element> = {
  instagram_feed: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  instagram_story: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  twitter: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  facebook: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  youtube_thumb: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
};

interface PlatformPackProps {
  pet: Pet;
  platform: PlatformSpec;
  onDownload: () => void;
  isGenerating: boolean;
}

export default function PlatformPack({ pet, platform, onDownload, isGenerating }: PlatformPackProps) {
  const accent = PLATFORM_COLORS[platform.key] || 'var(--color-navy)';
  const icon = PLATFORM_ICONS[platform.key];
  const previewPublicId = pet.publicIds[0];
  const previewSrc = previewPublicId ? platformUrl(previewPublicId, platform.key) : '';
  const aspectRatio = `${platform.width} / ${platform.height}`;

  return (
    <div className="platform-card" style={{ '--platform-accent': accent } as React.CSSProperties}>
      {/* Preview */}
      {previewSrc && (
        <div className="platform-preview" style={{ aspectRatio }}>
          <img src={previewSrc} alt={`${pet.name} — ${platform.label}`} loading="lazy" />
        </div>
      )}

      {/* Info */}
      <div className="platform-card-body">
        <div className="platform-card-header">
          <span className="platform-icon" style={{ color: accent }}>{icon}</span>
          <div>
            <h3 className="platform-card-name">{platform.label}</h3>
            <span className="platform-card-dims">{platform.width} &times; {platform.height}</span>
          </div>
        </div>
        <p className="platform-card-desc">{platform.description}</p>
        <button
          type="button"
          className="btn btn-primary platform-card-btn"
          onClick={onDownload}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <span className="upload-spinner">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Generating...
            </span>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download ZIP
            </>
          )}
        </button>
      </div>
    </div>
  );
}
