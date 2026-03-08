import { useState, useEffect, useCallback } from 'react';
import { galleryUrl, lightboxUrl, videoThumbnailUrl, videoUrl } from '../../cloudinary/transformations';

interface PetGalleryProps {
  publicIds: string[];
  resourceTypes?: string[];
}

export default function PetGallery({ publicIds, resourceTypes = [] }: PetGalleryProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const closeLightbox = useCallback(() => setLightboxIdx(null), []);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIdx, closeLightbox]);

  if (publicIds.length === 0) return null;

  const isVideo = (idx: number) => (resourceTypes[idx] || 'image') === 'video';

  return (
    <>
      <div className="pet-gallery-grid">
        {publicIds.map((pid, idx) => (
          <button
            key={pid}
            className="pet-gallery-item"
            onClick={() => setLightboxIdx(idx)}
            type="button"
            aria-label={isVideo(idx) ? 'Play video' : 'View photo full size'}
          >
            {isVideo(idx) ? (
              <div className="pet-gallery-video-thumb">
                <img src={videoThumbnailUrl(pid)} alt="Pet video thumbnail" loading="lazy" />
                <div className="pet-gallery-play-icon" aria-hidden="true">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="white" stroke="none">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </div>
              </div>
            ) : (
              <img src={galleryUrl(pid)} alt="Pet photo" loading="lazy" />
            )}
          </button>
        ))}
      </div>

      {lightboxIdx !== null && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox} type="button" aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          {isVideo(lightboxIdx) ? (
            <video
              className="lightbox-video"
              src={videoUrl(publicIds[lightboxIdx])}
              controls
              autoPlay
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              className="lightbox-image"
              src={lightboxUrl(publicIds[lightboxIdx])}
              alt="Pet photo enlarged"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </>
  );
}
