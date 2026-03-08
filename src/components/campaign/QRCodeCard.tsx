import { useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getProfileUrl } from '../../utils/profileUrl';

interface QRCodeCardProps {
  petId: string;
  petName: string;
}

export default function QRCodeCard({ petId, petName }: QRCodeCardProps) {
  const svgWrapRef = useRef<HTMLDivElement>(null);
  const profileUrl = getProfileUrl(petId);

  const handleDownload = useCallback(() => {
    const svgEl = svgWrapRef.current?.querySelector('svg');
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(img, 0, 0, 512, 512);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${petName.replace(/[^a-zA-Z0-9]+/g, '_')}_QR.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`;
  }, [petName]);

  return (
    <div className="qr-card">
      <span className="pet-info-label">QR Code</span>
      <div className="qr-card-svg" ref={svgWrapRef}>
        <QRCodeSVG
          value={profileUrl}
          size={200}
          fgColor="#002b60"
          bgColor="#ffffff"
          level="M"
        />
      </div>
      <span className="qr-card-url">{profileUrl}</span>
      <button type="button" className="btn btn-outline btn-sm qr-card-btn" onClick={handleDownload} aria-label="Download QR code as PNG">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Download QR
      </button>
    </div>
  );
}
