import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Pet } from '../../types/pet';
import { getProfileUrl } from '../../utils/profileUrl';

interface KennelCardProps {
  pet: Pet;
}

export default function KennelCard({ pet }: KennelCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const profileUrl = getProfileUrl(pet.id);

  const spayNeuterLabel = pet.sex === 'Female' ? 'Spayed' : pet.sex === 'Male' ? 'Neutered' : 'Spayed/Neutered';

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
          <img src="/pawprint-logo.png" alt="" width="22" height="22" />
          <span>PawPrint</span>
        </div>

        <div className="kennel-card-grid">
          {/* Details */}
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

            {/* Medical info */}
            <div className="kennel-card-medical">
              <div className="kennel-card-medical-row">
                <span className="kennel-card-medical-label">Vaccination</span>
                <span className={`kennel-card-medical-value ${pet.vaccination === 'Up to date' ? 'kennel-card-medical-value--good' : ''}`}>
                  {pet.vaccination || 'Unknown'}
                </span>
              </div>
              <div className="kennel-card-medical-row">
                <span className="kennel-card-medical-label">{spayNeuterLabel}</span>
                <span className={`kennel-card-medical-value ${pet.spayedNeutered === 'Yes' ? 'kennel-card-medical-value--good' : ''}`}>
                  {pet.spayedNeutered || 'Unknown'}
                </span>
              </div>
            </div>

            <div className="kennel-card-shelter">
              <strong>{pet.shelterName}</strong>
              {pet.shelterContact && <span>{pet.shelterContact}</span>}
              {pet.shelterLocation && <span>{pet.shelterLocation}</span>}
            </div>
          </div>

          {/* QR Code */}
          <div className="kennel-card-qr-section">
            <QRCodeSVG
              value={profileUrl}
              size={120}
              fgColor="#002b60"
              bgColor="#ffffff"
              level="M"
            />
            <span className="kennel-card-scan-label">Scan to learn more!</span>
          </div>
        </div>
      </div>
    </>
  );
}
