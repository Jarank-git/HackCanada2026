import { useState } from 'react';
import type { UploadedAsset } from '../../types/pet';
import type { PhotoTip } from '../../api/gemini';
import { UploadWidget, type CloudinaryUploadResult } from '../../cloudinary/UploadWidget';
import { getQualityTier } from '../../utils/qualityTier';
import { analyzeImage, getPhotoSuggestions } from '../../utils/photoAnalysis';

interface PhotoDropZoneProps {
  assets: UploadedAsset[];
  onUpload: (asset: UploadedAsset) => void;
  onRemove: (publicId: string) => void;
  maxPhotos?: number;
  folder?: string;
  metadata?: Record<string, string>;
  heroPublicId?: string | null;
  onSetHero?: (publicId: string) => void;
  aiTips?: PhotoTip[] | null;
  aiTipsLoading?: boolean;
}

export default function PhotoDropZone({
  assets,
  onUpload,
  onRemove,
  maxPhotos = 10,
  folder,
  metadata,
  heroPublicId,
  onSetHero,
  aiTips,
  aiTipsLoading,
}: PhotoDropZoneProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function handleUploadSuccess(result: CloudinaryUploadResult) {
    onUpload({
      publicId: result.public_id,
      secureUrl: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      resourceType: result.resource_type,
      bytes: result.bytes,
      qualityScore: result.quality_analysis?.focus ?? null,
    });
  }

  const atLimit = assets.length >= maxPhotos;
  const suggestions = getPhotoSuggestions(assets);

  return (
    <div className="photo-drop-zone">
      <div className="drop-zone-header">
        <span className="drop-zone-count">
          {assets.length} / {maxPhotos} photos
        </span>
      </div>

      {assets.length > 0 && (
        <>
          <div className="quality-legend">
            <span className="quality-legend-item">
              <span className="quality-legend-dot quality-legend-dot--teal" />
              Best
            </span>
            <span className="quality-legend-item">
              <span className="quality-legend-dot quality-legend-dot--gold" />
              Good
            </span>
            <span className="quality-legend-item">
              <span className="quality-legend-dot quality-legend-dot--coral" />
              Poor
            </span>
            <span className="quality-legend-hint">Click a photo to set as hero</span>
          </div>

          <div className="thumb-grid">
            {assets.map((asset) => {
              const tier = getQualityTier(asset.qualityScore);
              const isHero = heroPublicId === asset.publicId;
              const isExpanded = expandedId === asset.publicId;
              const analysis = analyzeImage(asset, assets, heroPublicId ?? null);

              return (
                <div key={asset.publicId} className="thumb-item-wrapper">
                  <div
                    className={`thumb-item thumb-item--${tier.cssClass}${isHero ? ' thumb-item--hero' : ''}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSetHero?.(asset.publicId)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSetHero?.(asset.publicId);
                      }
                    }}
                    aria-label={`Set as hero photo${isHero ? ' (currently hero)' : ''}`}
                  >
                    {isHero && (
                      <span className="thumb-hero-badge" aria-label="Hero photo">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </span>
                    )}
                    <img
                      src={`https://res.cloudinary.com/dp498emx3/image/upload/c_fill,w_150,h_150,g_auto/f_auto,q_auto:good/${asset.publicId}`}
                      alt=""
                      className="thumb-img"
                    />
                    <span className={`thumb-quality-badge thumb-quality-badge--${tier.cssClass}`}>
                      {tier.label}
                    </span>
                    <button
                      type="button"
                      className="thumb-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(asset.publicId);
                      }}
                      onKeyDown={(e) => e.stopPropagation()}
                      aria-label="Remove photo"
                    >
                      &times;
                    </button>
                  </div>

                  {/* Enhancement info toggle */}
                  <button
                    type="button"
                    className="thumb-info-toggle"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedId(isExpanded ? null : asset.publicId);
                    }}
                    aria-label="View enhancement details"
                    aria-expanded={isExpanded}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    {isExpanded ? 'Hide details' : 'View edits'}
                  </button>

                  {/* Expanded enhancement panel */}
                  {isExpanded && (
                    <div className="thumb-analysis-panel">
                      <p className="thumb-analysis-hero">{analysis.heroReasoning}</p>
                      <ul className="thumb-analysis-list">
                        {analysis.enhancements.map((e, i) => (
                          <li key={i}>
                            <strong>{e.label}</strong>
                            <span>{e.description}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="thumb-analysis-note">{analysis.overallNote}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {!atLimit && (
        <div className="upload-placeholder">
          <svg
            width="52"
            height="52"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0.3 }}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p>Drag photos here or click to browse</p>
          <UploadWidget
            onUploadSuccess={handleUploadSuccess}
            buttonText="Upload Photos"
            className="btn btn-primary"
            folder={folder}
            metadata={metadata}
          />
        </div>
      )}

      {atLimit && (
        <p className="drop-zone-limit">Maximum photos reached.</p>
      )}

      {/* Photo suggestions — AI-driven when available, fallback to heuristic */}
      {assets.length > 0 && (aiTipsLoading || (aiTips && aiTips.length > 0) || suggestions.length > 0) && (
        <div className={`photo-suggestions${aiTips && aiTips.length > 0 ? ' photo-suggestions--ai' : ''}`}>
          <span className="photo-suggestions-title">
            {aiTipsLoading ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Analyzing your photo...
              </>
            ) : aiTips && aiTips.length > 0 ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" />
                </svg>
                AI Photo Coach
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Tips to boost your campaign
              </>
            )}
          </span>
          <div className="photo-suggestions-list">
            {aiTipsLoading ? (
              <>
                <div className="photo-suggestion-item photo-suggestion-item--shimmer">
                  <span className="shimmer-line shimmer-line--medium" />
                  <span className="shimmer-line shimmer-line--long" />
                </div>
                <div className="photo-suggestion-item photo-suggestion-item--shimmer">
                  <span className="shimmer-line shimmer-line--short" />
                  <span className="shimmer-line shimmer-line--medium" />
                </div>
              </>
            ) : aiTips && aiTips.length > 0 ? (
              aiTips.map((tip, i) => (
                <div key={i} className="photo-suggestion-item">
                  <span className="photo-suggestion-title">{tip.title}</span>
                  <span className="photo-suggestion-desc">{tip.description}</span>
                </div>
              ))
            ) : (
              suggestions.map((s, i) => (
                <div key={i} className="photo-suggestion-item">
                  <span className="photo-suggestion-title">{s.title}</span>
                  <span className="photo-suggestion-desc">{s.description}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
