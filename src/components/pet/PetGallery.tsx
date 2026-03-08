import { useState, useEffect, useCallback } from 'react';
import { galleryUrl, heroUrl } from '../../cloudinary/transformations';

interface PetGalleryProps {
  publicIds: string[];
}

export default function PetGallery({ publicIds }: PetGalleryProps) {
  const [lightboxId, setLightboxId] = useState<string | null>(null);

  const closeLightbox = useCallback(() => setLightboxId(null), []);

  useEffect(() => {
    if (!lightboxId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxId, closeLightbox]);

  if (publicIds.length === 0) return null;

  return (
    <>
      <div className="pet-gallery-grid">
        {publicIds.map((pid) => (
          <button
            key={pid}
            className="pet-gallery-item"
            onClick={() => setLightboxId(pid)}
            type="button"
            aria-label="View photo full size"
          >
            <img src={galleryUrl(pid)} alt="Pet photo" loading="lazy" />
          </button>
        ))}
      </div>

      {lightboxId && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox} type="button" aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <img
            className="lightbox-image"
            src={heroUrl(lightboxId)}
            alt="Pet photo enlarged"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
