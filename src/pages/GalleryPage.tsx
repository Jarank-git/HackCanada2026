import { useState, useEffect, useMemo } from 'react';
import { usePets } from '../hooks/usePets';
import PetCard from '../components/pet/PetCard';
import ErrorBanner from '../components/ui/ErrorBanner';
import EmptyState from '../components/ui/EmptyState';

const SPECIES_OPTIONS = ['All', 'Dog', 'Cat', 'Rabbit', 'Bird', 'Other'] as const;

const PAW_ICON = (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.25 }}>
    <ellipse cx="6.5" cy="5" rx="2" ry="2.5" />
    <ellipse cx="17.5" cy="5" rx="2" ry="2.5" />
    <ellipse cx="3.5" cy="11" rx="1.8" ry="2.2" />
    <ellipse cx="20.5" cy="11" rx="1.8" ry="2.2" />
    <ellipse cx="12" cy="15.5" rx="4.5" ry="4" />
  </svg>
);

export default function GalleryPage() {
  const { pets, loading, error, refresh } = usePets();
  const [speciesFilter, setSpeciesFilter] = useState('All');
  const [debouncedFilter, setDebouncedFilter] = useState('All');
  const [errorDismissed, setErrorDismissed] = useState(false);

  // Debounce species filter by 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedFilter(speciesFilter), 300);
    return () => clearTimeout(timer);
  }, [speciesFilter]);

  const filteredPets = useMemo(
    () => debouncedFilter === 'All'
      ? pets
      : pets.filter((p) => p.species.toLowerCase() === debouncedFilter.toLowerCase()),
    [pets, debouncedFilter],
  );

  return (
    <div className="page gallery-page">
      <div className="page-header">
        <h1>Available Pets</h1>
        <p>Browse pets looking for their forever home.</p>
      </div>

      {/* Filters */}
      {!loading && pets.length > 0 && (
        <div className="gallery-filters">
          <label htmlFor="species-filter" className="sr-only">Filter by species</label>
          <select
            id="species-filter"
            className="form-input form-select gallery-filter-select"
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value)}
          >
            {SPECIES_OPTIONS.map((s) => (
              <option key={s} value={s}>{s === 'All' ? 'All Species' : s}</option>
            ))}
          </select>
          <button className="btn btn-outline gallery-refresh-btn" onClick={refresh} type="button" aria-label="Refresh pet list">
            Refresh
          </button>
        </div>
      )}

      {/* Error state */}
      {error && !errorDismissed && (
        <div style={{ marginBottom: '1.5rem' }}>
          <ErrorBanner
            message={error}
            onRetry={() => { setErrorDismissed(false); refresh(); }}
            onDismiss={() => setErrorDismissed(true)}
          />
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
        <EmptyState
          icon={PAW_ICON}
          title="No campaigns yet"
          description="Be the first to create an adoption campaign for a pet in need."
          action={{ label: 'Create a Campaign', to: '/upload' }}
        />
      )}

      {/* No results for filter */}
      {!loading && !error && pets.length > 0 && filteredPets.length === 0 && (
        <EmptyState
          icon={PAW_ICON}
          title={`No ${debouncedFilter.toLowerCase()} pets found`}
          description="Try selecting a different species filter."
        />
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
