import type { UploadedAsset } from '../../types/pet';
import { UploadWidget, type CloudinaryUploadResult } from '../../cloudinary/UploadWidget';

interface PhotoDropZoneProps {
  assets: UploadedAsset[];
  onUpload: (asset: UploadedAsset) => void;
  onRemove: (publicId: string) => void;
  maxPhotos?: number;
  folder?: string;
  metadata?: Record<string, string>;
}

export default function PhotoDropZone({
  assets,
  onUpload,
  onRemove,
  maxPhotos = 10,
  folder,
  metadata,
}: PhotoDropZoneProps) {
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

  return (
    <div className="photo-drop-zone">
      <div className="drop-zone-header">
        <span className="drop-zone-count">
          {assets.length} / {maxPhotos} photos
        </span>
      </div>

      {assets.length > 0 && (
        <div className="thumb-grid">
          {assets.map((asset) => (
            <div key={asset.publicId} className="thumb-item">
              <img
                src={`https://res.cloudinary.com/dp498emx3/image/upload/c_fill,w_150,h_150,g_auto/f_auto,q_auto/${asset.publicId}`}
                alt=""
                className="thumb-img"
              />
              <button
                type="button"
                className="thumb-remove"
                onClick={() => onRemove(asset.publicId)}
                aria-label="Remove photo"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
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
    </div>
  );
}
