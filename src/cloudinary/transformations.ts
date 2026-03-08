import { cld } from './config';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';
import { auto as autoFormat } from '@cloudinary/url-gen/qualifiers/format';
import { improve } from '@cloudinary/url-gen/actions/adjust';
import { source } from '@cloudinary/url-gen/actions/overlay';
import { text } from '@cloudinary/url-gen/qualifiers/source';
import { TextStyle } from '@cloudinary/url-gen/qualifiers/textStyle';
import { Position } from '@cloudinary/url-gen/qualifiers/position';
import { compass } from '@cloudinary/url-gen/qualifiers/gravity';
import type { PlatformKey } from '../types/platform';

const PLATFORM_DIMENSIONS: Record<PlatformKey, { width: number; height: number }> = {
  instagram_feed: { width: 1080, height: 1080 },
  instagram_story: { width: 1080, height: 1920 },
  twitter: { width: 1200, height: 675 },
  facebook: { width: 1200, height: 630 },
  youtube_thumb: { width: 1280, height: 720 },
};

export function heroUrl(publicId: string): string {
  return cld.image(publicId)
    .resize(fill().width(1200).height(800).gravity(autoGravity()))
    .adjust(improve())
    .delivery(format(autoFormat()))
    .delivery(quality(90))
    .toURL();
}

export function lightboxUrl(publicId: string): string {
  return cld.image(publicId)
    .resize(fill().width(1600).height(1200).gravity(autoGravity()))
    .adjust(improve())
    .delivery(format(autoFormat()))
    .delivery(quality(90))
    .toURL();
}

export function thumbnailUrl(publicId: string): string {
  return cld.image(publicId)
    .resize(fill().width(300).height(300).gravity(autoGravity()))
    .delivery(format(autoFormat()))
    .delivery(quality(80))
    .toURL();
}

export function socialCardUrl(publicId: string, petName: string, breed: string): string {
  return cld.image(publicId)
    .resize(fill().width(1200).height(630).gravity(autoGravity()))
    .adjust(improve())
    .overlay(
      source(
        text(petName, new TextStyle('Arial', 48).fontWeight('bold')).textColor('white')
      ).position(new Position().gravity(compass('south')).offsetY(70))
    )
    .overlay(
      source(
        text(breed, new TextStyle('Arial', 28)).textColor('white')
      ).position(new Position().gravity(compass('south')).offsetY(30))
    )
    .delivery(format(autoFormat()))
    .delivery(quality(90))
    .toURL();
}

export function platformUrl(publicId: string, platform: PlatformKey): string {
  const { width, height } = PLATFORM_DIMENSIONS[platform];
  return cld.image(publicId)
    .resize(fill().width(width).height(height).gravity(autoGravity()))
    .adjust(improve())
    .delivery(format(autoFormat()))
    .delivery(quality(90))
    .toURL();
}

export function galleryUrl(publicId: string): string {
  return cld.image(publicId)
    .resize(fill().width(900).height(600).gravity(autoGravity()))
    .adjust(improve())
    .delivery(format(autoFormat()))
    .delivery(quality(85))
    .toURL();
}
