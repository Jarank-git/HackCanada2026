import { AdvancedImage } from '@cloudinary/react';
import { cld } from '../../cloudinary/config';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';
import { auto as autoFormat } from '@cloudinary/url-gen/qualifiers/format';
import { auto as autoQuality } from '@cloudinary/url-gen/qualifiers/quality';
import { improve } from '@cloudinary/url-gen/actions/adjust';

interface PetHeroProps {
  publicId: string;
  petName: string;
}

export default function PetHero({ publicId, petName }: PetHeroProps) {
  const heroImg = cld.image(publicId)
    .resize(fill().width(800).height(600).gravity(autoGravity()))
    .adjust(improve())
    .delivery(format(autoFormat()))
    .delivery(quality(autoQuality()));

  return (
    <div className="pet-hero-container">
      <AdvancedImage cldImg={heroImg} alt={petName} width={800} height={600} />
      <div className="pet-hero-overlay">
        <h1 className="pet-hero-name">{petName}</h1>
      </div>
    </div>
  );
}
