export { PLATFORMS } from '../types/platform';
export type { PlatformSpec, PlatformKey } from '../types/platform';

import type { PlatformKey } from '../types/platform';

export function getFilenameForPlatform(
  petName: string,
  platform: PlatformKey,
  index: number,
  resourceType = 'image',
): string {
  const safeName = petName.replace(/[^a-zA-Z0-9]+/g, '_').replace(/_+$/, '');
  const ext = resourceType === 'video' ? 'mp4' : 'jpg';
  return `${safeName}_${platform}_${index}.${ext}`;
}
