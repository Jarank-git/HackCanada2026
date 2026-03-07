import type { Pet } from '../../types/pet';
import type { PlatformKey } from '../../types/platform';
import { platformUrl } from '../../cloudinary/transformations';

interface SocialPreviewProps {
  pet: Pet;
  platform: PlatformKey;
}

function InstagramFrame({ pet, imgSrc }: { pet: Pet; imgSrc: string }) {
  return (
    <div className="social-preview-frame social-preview--instagram">
      <div className="social-preview-bar">
        <div className="social-preview-avatar" />
        <span className="social-preview-username">{pet.shelterName || 'shelter'}</span>
      </div>
      <img src={imgSrc} alt={pet.name} className="social-preview-img" />
      <div className="social-preview-caption-bar">
        <div className="social-preview-actions">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </div>
        <p className="social-preview-text">
          <strong>{pet.shelterName || 'shelter'}</strong>{' '}
          {pet.caption ? pet.caption.slice(0, 120) + (pet.caption.length > 120 ? '...' : '') : `Meet ${pet.name}!`}
        </p>
      </div>
    </div>
  );
}

function TwitterFrame({ pet, imgSrc }: { pet: Pet; imgSrc: string }) {
  return (
    <div className="social-preview-frame social-preview--twitter">
      <div className="social-preview-bar">
        <div className="social-preview-avatar" />
        <div>
          <span className="social-preview-username">{pet.shelterName || 'Shelter'}</span>
          <span className="social-preview-handle">@{(pet.shelterName || 'shelter').replace(/\s+/g, '').toLowerCase()}</span>
        </div>
      </div>
      <p className="social-preview-tweet-text">
        {pet.caption ? pet.caption.slice(0, 200) + (pet.caption.length > 200 ? '...' : '') : `Meet ${pet.name}! Looking for a forever home.`}
      </p>
      <img src={imgSrc} alt={pet.name} className="social-preview-img social-preview-img--rounded" />
    </div>
  );
}

function GenericFrame({ pet, imgSrc, label }: { pet: Pet; imgSrc: string; label: string }) {
  return (
    <div className="social-preview-frame social-preview--generic">
      <div className="social-preview-bar">
        <div className="social-preview-avatar" />
        <span className="social-preview-username">{pet.shelterName || 'Shelter'}</span>
        <span className="social-preview-platform-badge">{label}</span>
      </div>
      <img src={imgSrc} alt={pet.name} className="social-preview-img" />
      <div className="social-preview-caption-bar">
        <p className="social-preview-text">
          {pet.caption ? pet.caption.slice(0, 150) + (pet.caption.length > 150 ? '...' : '') : `Meet ${pet.name}!`}
        </p>
      </div>
    </div>
  );
}

export default function SocialPreview({ pet, platform }: SocialPreviewProps) {
  const publicId = pet.publicIds[0];
  if (!publicId) return null;
  const imgSrc = platformUrl(publicId, platform);

  switch (platform) {
    case 'instagram_feed':
    case 'instagram_story':
      return <InstagramFrame pet={pet} imgSrc={imgSrc} />;
    case 'twitter':
      return <TwitterFrame pet={pet} imgSrc={imgSrc} />;
    case 'facebook':
      return <GenericFrame pet={pet} imgSrc={imgSrc} label="Facebook" />;
    case 'youtube_thumb':
      return <GenericFrame pet={pet} imgSrc={imgSrc} label="YouTube" />;
    default:
      return <GenericFrame pet={pet} imgSrc={imgSrc} label={platform} />;
  }
}
