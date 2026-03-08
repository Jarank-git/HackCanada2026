import type { PetFormData } from '../../types/pet';

const TEMPERAMENT_OPTIONS = [
  'Friendly',
  'Shy',
  'Playful',
  'Calm',
  'Energetic',
  'Gentle',
  'Independent',
  'Affectionate',
] as const;

const SPECIES_OPTIONS = ['Dog', 'Cat', 'Rabbit', 'Bird', 'Other'] as const;
const SEX_OPTIONS = ['Male', 'Female', 'Unknown'] as const;
const VACCINATION_OPTIONS = ['Up to date', 'Not up to date', 'Unknown'] as const;
const SPAY_NEUTER_OPTIONS = ['Yes', 'No', 'Unknown'] as const;

interface PetFormProps {
  value: PetFormData;
  onChange: (data: PetFormData) => void;
}

export default function PetForm({ value, onChange }: PetFormProps) {
  function update(field: keyof PetFormData, val: string | string[]) {
    onChange({ ...value, [field]: val });
  }

  function toggleTemperament(trait: string) {
    const next = value.temperament.includes(trait)
      ? value.temperament.filter((t) => t !== trait)
      : [...value.temperament, trait];
    update('temperament', next);
  }

  return (
    <div className="pet-form">
      {/* ── Pet Info ─────────────────────────────── */}
      <fieldset className="form-section">
        <legend className="form-section-title">Pet Info</legend>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="pet-name">Name</label>
            <input
              id="pet-name"
              className="form-input"
              type="text"
              placeholder="e.g. Buddy"
              value={value.name}
              onChange={(e) => update('name', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pet-species">Species</label>
            <select
              id="pet-species"
              className="form-input form-select"
              value={value.species}
              onChange={(e) => update('species', e.target.value)}
            >
              <option value="">Select species</option>
              {SPECIES_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="pet-breed">Breed</label>
            <input
              id="pet-breed"
              className="form-input"
              type="text"
              placeholder="e.g. Golden Retriever"
              value={value.breed}
              onChange={(e) => update('breed', e.target.value)}
            />
          </div>

          <div className="form-group form-group--half">
            <label className="form-label" htmlFor="pet-age">Age</label>
            <input
              id="pet-age"
              className="form-input"
              type="text"
              placeholder="e.g. 2 years"
              value={value.age}
              onChange={(e) => update('age', e.target.value)}
            />
          </div>

          <div className="form-group form-group--half">
            <label className="form-label" htmlFor="pet-sex">Sex</label>
            <select
              id="pet-sex"
              className="form-input form-select"
              value={value.sex}
              onChange={(e) => update('sex', e.target.value)}
            >
              <option value="">Select</option>
              {SEX_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="pet-vaccination">Vaccination Status</label>
            <select
              id="pet-vaccination"
              className="form-input form-select"
              value={value.vaccination}
              onChange={(e) => update('vaccination', e.target.value)}
            >
              <option value="">Select</option>
              {VACCINATION_OPTIONS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pet-spay-neuter">
              {value.sex === 'Female' ? 'Spayed' : value.sex === 'Male' ? 'Neutered' : 'Spayed / Neutered'}
            </label>
            <select
              id="pet-spay-neuter"
              className="form-input form-select"
              value={value.spayedNeutered}
              onChange={(e) => update('spayedNeutered', e.target.value)}
            >
              <option value="">Select</option>
              {SPAY_NEUTER_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* ── Temperament ─────────────────────────── */}
      <fieldset className="form-section">
        <legend className="form-section-title">Temperament</legend>
        <div className="temperament-grid">
          {TEMPERAMENT_OPTIONS.map((trait) => {
            const active = value.temperament.includes(trait);
            return (
              <button
                key={trait}
                type="button"
                className={`temperament-chip${active ? ' temperament-chip--active' : ''}`}
                onClick={() => toggleTemperament(trait)}
              >
                {trait}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* ── Shelter Info ────────────────────────── */}
      <fieldset className="form-section">
        <legend className="form-section-title">Shelter Info</legend>

        <div className="form-group">
          <label className="form-label" htmlFor="shelter-name">Shelter Name</label>
          <input
            id="shelter-name"
            className="form-input"
            type="text"
            placeholder="e.g. Happy Tails Rescue"
            value={value.shelterName}
            onChange={(e) => update('shelterName', e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="shelter-contact">Contact</label>
            <input
              id="shelter-contact"
              className="form-input"
              type="text"
              placeholder="e.g. (555) 123-4567"
              value={value.shelterContact}
              onChange={(e) => update('shelterContact', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="shelter-location">Location</label>
            <input
              id="shelter-location"
              className="form-input"
              type="text"
              placeholder="e.g. Toronto, ON"
              value={value.shelterLocation}
              onChange={(e) => update('shelterLocation', e.target.value)}
            />
          </div>
        </div>
      </fieldset>
    </div>
  );
}
