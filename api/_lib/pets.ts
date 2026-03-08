interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  metadata?: Record<string, string | string[]>;
  tags?: string[];
}

export interface CloudinarySearchResult {
  resources: CloudinaryResource[];
}

export function groupToPets(resources: CloudinaryResource[]) {
  const groups = new Map<string, CloudinaryResource[]>();

  for (const r of resources) {
    const petId = r.metadata?.pawprint_pet_id as string | undefined;
    if (!petId) continue;
    if (!groups.has(petId)) groups.set(petId, []);
    groups.get(petId)!.push(r);
  }

  return Array.from(groups.entries()).map(([petId, assets]) => {
    const first = assets[0];
    const md = first.metadata || {};
    const heroAsset = assets.find((a) => a.tags?.includes('hero'));

    const temperament = md.pawprint_temperament;
    const tempArray = Array.isArray(temperament)
      ? temperament
      : typeof temperament === 'string'
        ? temperament
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

    return {
      id: petId,
      name: (md.pawprint_pet_name as string) || '',
      species: (md.pawprint_species as string) || '',
      breed: (md.pawprint_breed as string) || '',
      age: (md.pawprint_age as string) || '',
      sex: (md.pawprint_sex as string) || '',
      heroUrl: heroAsset?.secure_url || undefined,
      temperament: tempArray,
      shelterName: (md.pawprint_shelter_name as string) || '',
      shelterContact: (md.pawprint_shelter_contact as string) || '',
      shelterLocation: (md.pawprint_shelter_location as string) || '',
      status: (md.pawprint_status as string) || 'Available',
      caption: (md.pawprint_caption as string) || '',
      galleryUrls: assets.map((a) => a.secure_url),
      publicIds: assets.map((a) => a.public_id),
    };
  });
}
