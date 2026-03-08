import { Link } from 'react-router-dom';
import type { Pet } from '../../types/pet';
import { heroUrl } from '../../cloudinary/transformations';

interface PetCardProps {
  pet: Pet;
}

export default function PetCard({ pet }: PetCardProps) {
  const imagePublicId = pet.publicIds[0] ?? '';
  const imgSrc = imagePublicId
    ? heroUrl(imagePublicId)
    : '';

  return (
    <Link to={`/pet/${pet.id}`} className="pet-card">
      <div className="pet-card-image-wrap">
        {imgSrc ? (
          <img
            className="pet-card-image"
            src={imgSrc}
            alt={`${pet.name} photo`}
            loading="lazy"
          />
        ) : (
          <div className="pet-card-image pet-card-image--placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.25 }}>
              <ellipse cx="6.5" cy="5" rx="2" ry="2.5" />
              <ellipse cx="17.5" cy="5" rx="2" ry="2.5" />
              <ellipse cx="3.5" cy="11" rx="1.8" ry="2.2" />
              <ellipse cx="20.5" cy="11" rx="1.8" ry="2.2" />
              <ellipse cx="12" cy="15.5" rx="4.5" ry="4" />
            </svg>
          </div>
        )}
      </div>

      <div className="pet-card-body">
        <h3 className="pet-card-name">{pet.name}</h3>
        <p className="pet-card-subtitle">
          {pet.breed}{pet.age ? ` \u00B7 ${pet.age}` : ''}
        </p>

        <div className="pet-card-tags">
          <span className="tag tag--species">{pet.species}</span>
          {pet.temperament.slice(0, 3).map((t) => (
            <span key={t} className="tag tag--temperament">{t}</span>
          ))}
        </div>

        <span className="pet-card-link">
          View Profile
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
