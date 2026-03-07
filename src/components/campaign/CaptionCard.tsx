import { useState } from 'react';

interface CaptionCardProps {
  caption: string;
  petName: string;
}

export default function CaptionCard({ caption, petName }: CaptionCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  }

  if (!caption) {
    return (
      <div className="caption-card caption-card--empty">
        <p>No caption generated yet for {petName}.</p>
      </div>
    );
  }

  return (
    <div className="caption-card">
      <div className="caption-card-header">
        <span className="section-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          AI Caption
        </span>
        <button type="button" className="btn btn-outline btn-sm" onClick={handleCopy}>
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              Copy Caption
            </>
          )}
        </button>
      </div>
      <p className="caption-card-text">{caption}</p>
      <span className="caption-card-count">{caption.length} characters</span>
    </div>
  );
}
