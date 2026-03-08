import { useState, useCallback } from 'react';
import Toast from '../ui/Toast';
import { getProfileUrl } from '../../utils/profileUrl';

interface ShareButtonProps {
  petId: string;
}

export default function ShareButton({ petId }: ShareButtonProps) {
  const [showToast, setShowToast] = useState(false);

  const profileUrl = getProfileUrl(petId);

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Check out this pet!', url: profileUrl });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(profileUrl);
      setShowToast(true);
    } catch {
      // Fallback: select from a temporary input
      const input = document.createElement('input');
      input.value = profileUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setShowToast(true);
    }
  }

  const handleToastDone = useCallback(() => setShowToast(false), []);

  return (
    <>
      <button className="btn btn-outline share-btn" onClick={handleShare} type="button" aria-label="Share pet profile">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        Share Profile
      </button>
      <Toast message="Link copied to clipboard!" visible={showToast} onDone={handleToastDone} />
    </>
  );
}
