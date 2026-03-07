export type PlatformKey = 'instagram_feed' | 'instagram_story' | 'twitter' | 'facebook' | 'youtube_thumb';

export interface PlatformSpec {
  key: PlatformKey;
  label: string;
  width: number;
  height: number;
  description: string;
}

export const PLATFORMS: PlatformSpec[] = [
  { key: 'instagram_feed', label: 'Instagram Feed', width: 1080, height: 1080, description: 'Square post for Instagram feed' },
  { key: 'instagram_story', label: 'Instagram Story', width: 1080, height: 1920, description: 'Vertical format for Instagram Stories' },
  { key: 'twitter', label: 'Twitter', width: 1200, height: 675, description: 'Landscape image for Twitter posts' },
  { key: 'facebook', label: 'Facebook', width: 1200, height: 630, description: 'Shared link or post image for Facebook' },
  { key: 'youtube_thumb', label: 'YouTube Thumbnail', width: 1280, height: 720, description: 'Thumbnail image for YouTube videos' },
];
