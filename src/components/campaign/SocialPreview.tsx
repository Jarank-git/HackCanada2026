import type { Pet } from '../../types/pet';
import type { PlatformKey } from '../../types/platform';
import type { PlatformCaptions } from '../../api/gemini';
import { assetPlatformUrl } from '../../cloudinary/transformations';

interface SocialPreviewProps {
  pet: Pet;
  platform: PlatformKey;
  platformCaptions: PlatformCaptions;
}

function getCaption(platformCaptions: PlatformCaptions, platform: PlatformKey): string {
  return platformCaptions[platform]?.caption || '';
}

function getHashtags(platformCaptions: PlatformCaptions, platform: PlatformKey): string[] {
  return platformCaptions[platform]?.hashtags || [];
}

/* ── Instagram Feed ────────────────────────── */
function InstagramFeedFrame({ pet, imgSrc, caption, hashtags }: {
  pet: Pet; imgSrc: string; caption: string; hashtags: string[];
}) {
  const username = (pet.shelterName || 'shelter').replace(/\s+/g, '').toLowerCase();
  const hashtagStr = hashtags.map(h => `#${h}`).join(' ');

  return (
    <div className="sp-frame sp-instagram-feed">
      {/* Header */}
      <div className="sp-ig-header">
        <div className="sp-ig-avatar" />
        <div className="sp-ig-header-info">
          <span className="sp-ig-username">{username}</span>
        </div>
        <svg className="sp-ig-more" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
        </svg>
      </div>

      {/* Image */}
      <img src={imgSrc} alt={pet.name} className="sp-ig-image" />

      {/* Actions */}
      <div className="sp-ig-actions">
        <div className="sp-ig-actions-left">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
        </div>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>
      </div>

      {/* Caption */}
      <div className="sp-ig-caption">
        <p>
          <strong>{username}</strong>{' '}
          {caption.length > 125 ? caption.slice(0, 125) + '... ' : caption + ' '}
          {hashtags.length > 0 && (
            <span className="sp-ig-hashtags">{hashtagStr}</span>
          )}
        </p>
      </div>
    </div>
  );
}

/* ── Instagram Story ───────────────────────── */
function InstagramStoryFrame({ pet, imgSrc, caption }: {
  pet: Pet; imgSrc: string; caption: string;
}) {
  const username = (pet.shelterName || 'shelter').replace(/\s+/g, '').toLowerCase();

  return (
    <div className="sp-frame sp-instagram-story">
      {/* Background image */}
      <div className="sp-story-bg" style={{ backgroundImage: `url(${imgSrc})` }}>
        {/* Progress bars */}
        <div className="sp-story-progress">
          <div className="sp-story-progress-bar sp-story-progress-bar--filled" />
          <div className="sp-story-progress-bar" />
          <div className="sp-story-progress-bar" />
        </div>

        {/* Header */}
        <div className="sp-story-header">
          <div className="sp-story-avatar" />
          <span className="sp-story-username">{username}</span>
          <span className="sp-story-time">2h</span>
          <div className="sp-story-header-right">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </div>
        </div>

        {/* Caption overlay at bottom */}
        <div className="sp-story-bottom">
          <p className="sp-story-caption">{caption}</p>
          <div className="sp-story-reply">
            <div className="sp-story-reply-input">Send message</div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Twitter / X ───────────────────────────── */
function TwitterFrame({ pet, imgSrc, caption, hashtags }: {
  pet: Pet; imgSrc: string; caption: string; hashtags: string[];
}) {
  const displayName = pet.shelterName || 'Shelter';
  const handle = '@' + displayName.replace(/\s+/g, '').toLowerCase();
  const hashtagStr = hashtags.map(h => `#${h}`).join(' ');
  const fullText = caption + (hashtagStr ? ' ' + hashtagStr : '');

  return (
    <div className="sp-frame sp-twitter">
      <div className="sp-tw-post">
        {/* Header */}
        <div className="sp-tw-header">
          <div className="sp-tw-avatar" />
          <div className="sp-tw-header-info">
            <div className="sp-tw-name-row">
              <span className="sp-tw-displayname">{displayName}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#1d9bf0"><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" /></svg>
            </div>
            <span className="sp-tw-handle">{handle}</span>
          </div>
          <svg className="sp-tw-logo" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
        </div>

        {/* Tweet text */}
        <p className="sp-tw-text">
          {fullText.length > 280 ? fullText.slice(0, 277) + '...' : fullText}
        </p>

        {/* Image */}
        <div className="sp-tw-image-wrapper">
          <img src={imgSrc} alt={pet.name} className="sp-tw-image" />
        </div>

        {/* Engagement bar */}
        <div className="sp-tw-engagement">
          <div className="sp-tw-action">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
            <span>12</span>
          </div>
          <div className="sp-tw-action sp-tw-action--repost">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 01-4 4H3" /></svg>
            <span>48</span>
          </div>
          <div className="sp-tw-action sp-tw-action--heart">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
            <span>231</span>
          </div>
          <div className="sp-tw-action">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Facebook ──────────────────────────────── */
function FacebookFrame({ pet, imgSrc, caption, hashtags }: {
  pet: Pet; imgSrc: string; caption: string; hashtags: string[];
}) {
  const displayName = pet.shelterName || 'Shelter';
  const hashtagStr = hashtags.map(h => `#${h}`).join(' ');

  return (
    <div className="sp-frame sp-facebook">
      {/* Header */}
      <div className="sp-fb-header">
        <div className="sp-fb-avatar" />
        <div className="sp-fb-header-info">
          <span className="sp-fb-name">{displayName}</span>
          <div className="sp-fb-meta">
            <span>Just now</span>
            <span>&middot;</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
          </div>
        </div>
        <svg className="sp-fb-more" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
      </div>

      {/* Caption text */}
      <div className="sp-fb-caption">
        <p>{caption}</p>
        {hashtags.length > 0 && (
          <p className="sp-fb-hashtags">{hashtagStr}</p>
        )}
      </div>

      {/* Image */}
      <img src={imgSrc} alt={pet.name} className="sp-fb-image" />

      {/* Reactions bar */}
      <div className="sp-fb-reactions">
        <div className="sp-fb-reaction-icons">
          <span className="sp-fb-emoji">&#128077;</span>
          <span className="sp-fb-emoji">&#10084;&#65039;</span>
          <span className="sp-fb-reaction-count">42</span>
        </div>
        <span className="sp-fb-comments-count">8 comments &middot; 15 shares</span>
      </div>

      {/* Action bar */}
      <div className="sp-fb-action-bar">
        <button type="button" className="sp-fb-action">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" /><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" /></svg>
          Like
        </button>
        <button type="button" className="sp-fb-action">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
          Comment
        </button>
        <button type="button" className="sp-fb-action">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
          Share
        </button>
      </div>
    </div>
  );
}

/* ── YouTube Thumbnail ─────────────────────── */
function YouTubeFrame({ pet, imgSrc, caption }: {
  pet: Pet; imgSrc: string; caption: string;
}) {
  const channelName = pet.shelterName || 'Shelter';

  return (
    <div className="sp-frame sp-youtube">
      {/* Thumbnail with play overlay */}
      <div className="sp-yt-thumbnail">
        <img src={imgSrc} alt={pet.name} className="sp-yt-image" />
        <div className="sp-yt-play">
          <svg width="48" height="48" viewBox="0 0 68 48" fill="none">
            <path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55C3.97 2.33 2.27 4.81 1.48 7.74.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="red" />
            <path d="M45 24L27 14v20" fill="white" />
          </svg>
        </div>
        <span className="sp-yt-duration">3:24</span>
      </div>

      {/* Video info */}
      <div className="sp-yt-info">
        <div className="sp-yt-channel-avatar" />
        <div className="sp-yt-meta">
          <h3 className="sp-yt-title">{caption || `Meet ${pet.name}!`}</h3>
          <p className="sp-yt-channel">{channelName}</p>
          <p className="sp-yt-stats">1.2K views &middot; 2 hours ago</p>
        </div>
        <svg className="sp-yt-more" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>
      </div>
    </div>
  );
}

export default function SocialPreview({ pet, platform, platformCaptions }: SocialPreviewProps) {
  const publicId = pet.publicIds[0];
  if (!publicId) return null;
  const resourceType = pet.resourceTypes?.[0] || 'image';
  const imgSrc = assetPlatformUrl(publicId, platform, resourceType);
  const caption = getCaption(platformCaptions, platform);
  const hashtags = getHashtags(platformCaptions, platform);

  switch (platform) {
    case 'instagram_feed':
      return <InstagramFeedFrame pet={pet} imgSrc={imgSrc} caption={caption} hashtags={hashtags} />;
    case 'instagram_story':
      return <InstagramStoryFrame pet={pet} imgSrc={imgSrc} caption={caption} />;
    case 'twitter':
      return <TwitterFrame pet={pet} imgSrc={imgSrc} caption={caption} hashtags={hashtags} />;
    case 'facebook':
      return <FacebookFrame pet={pet} imgSrc={imgSrc} caption={caption} hashtags={hashtags} />;
    case 'youtube_thumb':
      return <YouTubeFrame pet={pet} imgSrc={imgSrc} caption={caption} />;
    default:
      return null;
  }
}
