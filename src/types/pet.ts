export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  sex: string;
  heroUrl?: string;
  temperament: string[];
  vaccination: string;
  spayedNeutered: string;
  shelterName: string;
  shelterContact: string;
  shelterLocation: string;
  status: string;
  caption: string;
  galleryUrls: string[];
  publicIds: string[];
}

export interface PetFormData {
  name: string;
  species: string;
  breed: string;
  age: string;
  sex: string;
  temperament: string[];
  vaccination: string;
  spayedNeutered: string;
  shelterName: string;
  shelterContact: string;
  shelterLocation: string;
}

export interface UploadedAsset {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  resourceType: string;
  bytes: number;
  qualityScore: number | null;
}
