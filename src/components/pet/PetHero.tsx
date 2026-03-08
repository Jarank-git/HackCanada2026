import { AdvancedImage } from '@cloudinary/react';
import { cld } from '../../cloudinary/config';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';
import { auto as autoFormat } from '@cloudinary/url-gen/qualifiers/format';
import { autoBest } from '@cloudinary/url-gen/qualifiers/quality';
import { improve } from '@cloudinary/url-gen/actions/adjust';

interface PetHeroProps {
  publicId: string;
  petName: string;
}

export default function PetHero({ publicId, petName }: PetHeroProps) {
  const heroImg = cld.image(publicId)
    .resize(fill().width(1200).height(800).gravity(autoGravity()))
    .adjust(improve())
    .delivery(format(autoFormat()))
    .delivery(quality(autoBest()));

  return (
    <div className="pet-hero-container">
      <AdvancedImage cldImg={heroImg} alt={petName} width={1200} height={800} />
      <div className="pet-hero-overlay">
        <h1 className="pet-hero-name">{petName}</h1>
      </div>
    </div>
  );
}
