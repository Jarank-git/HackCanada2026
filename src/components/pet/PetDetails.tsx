import type { Pet } from '../../types/pet';

interface PetDetailsProps {
  pet: Pet;
}

function statusVariant(status: string): string {
  switch (status.toLowerCase()) {
    case 'available': return 'status-badge--teal';
    case 'pending': return 'status-badge--gold';
    case 'adopted': return 'status-badge--coral';
    default: return 'status-badge--teal';
  }
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function PetDetails({ pet }: PetDetailsProps) {
  return (
    <div className="pet-details">
      {/* Status */}
      <span className={`status-badge ${statusVariant(pet.status)}`}>
        {pet.status || 'Available'}
      </span>

      {/* Info grid */}
      <div className="pet-details-grid">
        <div className="pet-info-item">
          <span className="pet-info-label">Species</span>
          <span className="pet-info-value">{pet.species}</span>
        </div>
        <div className="pet-info-item">
          <span className="pet-info-label">Breed</span>
          <span className="pet-info-value">{pet.breed}</span>
        </div>
        <div className="pet-info-item">
          <span className="pet-info-label">Age</span>
          <span className="pet-info-value">{pet.age || 'Unknown'}</span>
        </div>
        <div className="pet-info-item">
          <span className="pet-info-label">Sex</span>
          <span className="pet-info-value">{pet.sex || 'Unknown'}</span>
        </div>
      </div>

      {/* Medical info */}
      {(pet.vaccination || pet.spayedNeutered) && (
        <div className="pet-details-grid" style={{ marginTop: 0 }}>
          {pet.vaccination && (
            <div className="pet-info-item">
              <span className="pet-info-label">Vaccination</span>
              <span className={`pet-info-value ${pet.vaccination === 'Up to date' ? 'pet-info-value--good' : ''}`}>{pet.vaccination}</span>
            </div>
          )}
          {pet.spayedNeutered && (
            <div className="pet-info-item">
              <span className="pet-info-label">{pet.sex === 'Female' ? 'Spayed' : pet.sex === 'Male' ? 'Neutered' : 'Spayed/Neutered'}</span>
              <span className={`pet-info-value ${pet.spayedNeutered === 'Yes' ? 'pet-info-value--good' : ''}`}>{pet.spayedNeutered}</span>
            </div>
          )}
        </div>
      )}

      {/* Temperament */}
      {pet.temperament.length > 0 && (
        <div className="pet-details-section">
          <h3 className="pet-details-heading">Temperament</h3>
          <div className="pet-card-tags">
            {pet.temperament.map((t) => (
              <span key={t} className="tag tag--temperament">{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* Shelter info */}
      <div className="pet-details-section">
        <h3 className="pet-details-heading">Shelter Information</h3>
        <div className="pet-shelter-info">
          {pet.shelterName && (
            <div className="pet-shelter-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span>{pet.shelterName}</span>
            </div>
          )}
          {pet.shelterContact && (
            <div className="pet-shelter-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <span>{pet.shelterContact}</span>
            </div>
          )}
          {pet.shelterLocation && (
            <div className="pet-shelter-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>{pet.shelterLocation}</span>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      {pet.shelterContact && (
        isEmail(pet.shelterContact) ? (
          <a
            href={`mailto:${pet.shelterContact}?subject=Interested in adopting ${pet.name}`}
            className="btn btn-primary btn-lg pet-details-cta"
          >
            I'm Interested
          </a>
        ) : (
          <button className="btn btn-primary btn-lg pet-details-cta" type="button" disabled>
            Contact: {pet.shelterContact}
          </button>
        )
      )}
    </div>
  );
}
