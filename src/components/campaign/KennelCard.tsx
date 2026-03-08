import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Pet } from '../../types/pet';
import { heroUrl } from '../../cloudinary/transformations';
import { getProfileUrl } from '../../utils/profileUrl';

interface KennelCardProps {
  pet: Pet;
}

export default function KennelCard({ pet }: KennelCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const heroPublicId = pet.publicIds[0] ?? '';
  const imgSrc = heroPublicId ? heroUrl(heroPublicId) : '';
  const profileUrl = getProfileUrl(pet.id);

  function handlePrint() {
    window.print();
  }

  return (
    <>
      <button type="button" className="btn btn-outline kennel-card-print-btn" onClick={handlePrint} aria-label="Print kennel card">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 6 2 18 2 18 9" />
          <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" />
        </svg>
        Print Kennel Card
      </button>

      <div className="kennel-card" ref={cardRef}>
        {/* Logo */}
        <div className="kennel-card-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#002b60" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="6.5" cy="5" rx="2" ry="2.5" />
            <ellipse cx="17.5" cy="5" rx="2" ry="2.5" />
            <ellipse cx="3.5" cy="11" rx="1.8" ry="2.2" />
            <ellipse cx="20.5" cy="11" rx="1.8" ry="2.2" />
            <ellipse cx="12" cy="15.5" rx="4.5" ry="4" />
          </svg>
          <span>PawPrint</span>
        </div>

        <div className="kennel-card-grid">
          {/* Photo */}
          {imgSrc && (
            <div className="kennel-card-photo">
              <img src={imgSrc} alt={`${pet.name} photo`} />
            </div>
          )}

          {/* Info */}
          <div className="kennel-card-info">
            <h2 className="kennel-card-name">{pet.name}</h2>
            <div className="kennel-card-details">
              <span>{pet.breed}</span>
              <span>{pet.age} &middot; {pet.sex}</span>
            </div>

            {pet.temperament.length > 0 && (
              <div className="kennel-card-tags">
                {pet.temperament.map((t) => (
                  <span key={t} className="kennel-card-tag">{t}</span>
                ))}
              </div>
            )}

            <div className="kennel-card-shelter">
              <strong>{pet.shelterName}</strong>
              {pet.shelterContact && <span>{pet.shelterContact}</span>}
              {pet.shelterLocation && <span>{pet.shelterLocation}</span>}
            </div>

            <div className="kennel-card-qr">
              <QRCodeSVG
                value={profileUrl}
                size={96}
                fgColor="#002b60"
                bgColor="#ffffff"
                level="M"
              />
              <span className="kennel-card-scan-label">Scan to learn more!</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
