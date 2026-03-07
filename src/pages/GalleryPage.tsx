import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePets } from '../hooks/usePets';
import PetCard from '../components/pet/PetCard';

const SPECIES_OPTIONS = ['All', 'Dog', 'Cat', 'Rabbit', 'Bird', 'Other'] as const;

export default function GalleryPage() {
  const { pets, loading, error, refresh } = usePets();
  const [speciesFilter, setSpeciesFilter] = useState('All');

  const filteredPets = speciesFilter === 'All'
    ? pets
    : pets.filter((p) => p.species.toLowerCase() === speciesFilter.toLowerCase());

  return (
    <div className="page gallery-page">
      <div className="page-header">
        <h1>Available Pets</h1>
        <p>Browse pets looking for their forever home.</p>
      </div>

      {/* Filters */}
      {!loading && pets.length > 0 && (
        <div className="gallery-filters">
          <select
            className="form-input form-select gallery-filter-select"
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value)}
          >
            {SPECIES_OPTIONS.map((s) => (
              <option key={s} value={s}>{s === 'All' ? 'All Species' : s}</option>
            ))}
          </select>
          <button className="btn btn-outline gallery-refresh-btn" onClick={refresh} type="button">
            Refresh
          </button>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="upload-error" style={{ marginBottom: '1.5rem' }}>
          {error}
          <button className="btn btn-outline" onClick={refresh} style={{ marginLeft: '1rem' }} type="button">
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="gallery-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-image" />
              <div className="skeleton-body">
                <div className="skeleton-line skeleton-line--title" />
                <div className="skeleton-line skeleton-line--subtitle" />
                <div className="skeleton-tags">
                  <div className="skeleton-tag" />
                  <div className="skeleton-tag" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && pets.length === 0 && (
        <div className="gallery-empty">
          <div className="gallery-empty-icon">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.25 }}>
              <ellipse cx="6.5" cy="5" rx="2" ry="2.5" />
              <ellipse cx="17.5" cy="5" rx="2" ry="2.5" />
              <ellipse cx="3.5" cy="11" rx="1.8" ry="2.2" />
              <ellipse cx="20.5" cy="11" rx="1.8" ry="2.2" />
              <ellipse cx="12" cy="15.5" rx="4.5" ry="4" />
            </svg>
          </div>
          <p>No campaigns yet. Be the first!</p>
          <Link to="/upload" className="btn btn-primary" style={{ marginTop: '1.25rem' }}>
            Create a Campaign
          </Link>
        </div>
      )}

      {/* No results for filter */}
      {!loading && !error && pets.length > 0 && filteredPets.length === 0 && (
        <div className="gallery-empty">
          <p>No {speciesFilter.toLowerCase()} pets found.</p>
          <button
            className="btn btn-outline"
            onClick={() => setSpeciesFilter('All')}
            style={{ marginTop: '1rem' }}
            type="button"
          >
            Show All Pets
          </button>
        </div>
      )}

      {/* Pet cards grid */}
      {!loading && filteredPets.length > 0 && (
        <div className="gallery-grid">
          {filteredPets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      )}
    </div>
  );
}
