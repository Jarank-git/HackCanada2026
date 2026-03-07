# PawPrint Development Prompts

Sequential prompts for building PawPrint. Run each prompt in order — each builds on the previous step's output. Before each prompt, verify the previous step works by running the dev server.

---

## Prompt 1: Express Server Foundation

```
Set up the Express backend server for PawPrint. Create the following structure:

PawPrint/server/
├── package.json
├── tsconfig.json
├── .env
└── src/
    ├── index.ts
    └── services/
        └── cloudinary.ts

Requirements:
- package.json with express, cors, dotenv, cloudinary (v2), typescript, ts-node, @types/express, @types/cors as deps
- tsconfig.json targeting ES2020, module NodeNext, outDir dist
- .env with CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@dp498emx3 (use placeholder values for KEY/SECRET) and PORT=3001
- src/index.ts: Express app on port 3001 with:
  - CORS allowing origin http://localhost:5173
  - JSON body parsing
  - A health check GET /api/health returning { status: "ok" }
- src/services/cloudinary.ts: Initialize cloudinary v2 from CLOUDINARY_URL env var, export the configured instance
- Add "dev": "ts-node --esm src/index.ts" and "build": "tsc" scripts to package.json

Use `import { v2 as cloudinary } from 'cloudinary'` for the Cloudinary SDK. Keep the server minimal — just the foundation. Do NOT install dependencies (I'll do that myself).
```

---

## Prompt 2: Cloudinary Structured Metadata Fields

```
Create a one-time setup script that provisions all PawPrint Structured Metadata (SMD) fields in Cloudinary. Create:

PawPrint/server/src/scripts/setup-metadata.ts

This script should use the Cloudinary Admin API (via the cloudinary v2 SDK already configured in server/src/services/cloudinary.ts) to create these metadata fields, all with external_id prefixed "pawprint_":

1. pawprint_pet_id — type: string, label: "Pet ID", mandatory: false
2. pawprint_pet_name — type: string, label: "Pet Name"
3. pawprint_species — type: enum, label: "Species", values: ["Dog", "Cat", "Rabbit", "Bird", "Other"]
4. pawprint_breed — type: string, label: "Breed"
5. pawprint_age — type: string, label: "Age"
6. pawprint_sex — type: enum, label: "Sex", values: ["Male", "Female", "Unknown"]
7. pawprint_temperament — type: set, label: "Temperament", values: ["Friendly", "Shy", "Playful", "Calm", "Energetic", "Gentle", "Independent", "Affectionate"]
8. pawprint_shelter_name — type: string, label: "Shelter Name"
9. pawprint_shelter_contact — type: string, label: "Shelter Contact"
10. pawprint_shelter_location — type: string, label: "Shelter Location"
11. pawprint_status — type: enum, label: "Status", values: ["Available", "Pending", "Adopted"]
12. pawprint_caption — type: string, label: "Caption"

Use cloudinary.api.add_metadata_field() for each. The script should:
- Import the configured cloudinary instance from ../services/cloudinary
- Run each field creation sequentially
- Handle "already exists" errors gracefully (log and continue)
- Log success/failure for each field
- Add a "setup-metadata" script to server/package.json: "ts-node --esm src/scripts/setup-metadata.ts"

Reference Cloudinary docs: metadata field types are "string", "enum", "set". Enum and set fields need a datasource object with values array of { external_id: string, value: string } entries.
```

---

## Prompt 3: Signed Upload Endpoint

```
Add a signed upload endpoint to the Express server so the React frontend can upload directly to Cloudinary with metadata attached. Create/modify:

1. server/src/routes/sign.ts — POST /api/sign-upload
   - Accepts JSON body: { folder: string, metadata: Record<string, string> }
   - Generates a Cloudinary signature using cloudinary.utils.api_sign_request()
   - The params to sign should include: timestamp, folder, metadata (as pipe-delimited string for Cloudinary)
   - Returns: { signature, timestamp, cloudName, apiKey, folder, metadata }
   - Cloudinary metadata format: key=value pairs joined with "|" (e.g., "pawprint_pet_name=Buddy|pawprint_species=Dog")

2. server/src/index.ts — Mount the sign route: app.use('/api', signRouter)

3. src/cloudinary/UploadWidget.tsx — Modify the existing upload widget to support signed uploads:
   - Add a new prop `signEndpoint?: string` (default: "http://localhost:3001/api/sign-upload")
   - Add prop `uploadFolder?: string`
   - Add prop `metadata?: Record<string, string>`
   - When signEndpoint is provided, configure the widget with `uploadSignature` callback that fetches the signature from the server
   - Use Cloudinary Upload Widget's `prepareUploadParams` option to dynamically sign each upload
   - Keep the existing unsigned upload as fallback when signEndpoint is not provided
   - Allow multiple: true uploads (change from multiple: false)

Important: The Cloudinary Upload Widget's signed upload flow uses `apiKey` + `uploadSignature` (a function returning { signature, timestamp }) instead of `uploadPreset`. The metadata string must be included in the signed params.
```

---

## Prompt 4: Pet Form & Photo Drop Zone Components

```
Build the upload page UI components. Create the following files and update UploadPage:

1. src/types/pet.ts — Expand the existing Pet interface and add:
   - PetFormData interface with: name, species, breed, age, sex, temperament (string[]), shelterName, shelterContact, shelterLocation
   - UploadedAsset interface with: publicId, secureUrl, width, height, format, resourceType, bytes, qualityScore (number | null)
   - Keep the existing Pet interface but add all fields: temperament (string[]), shelterName, shelterContact, shelterLocation, status, caption, galleryUrls (string[]), publicIds (string[])

2. src/components/upload/PetForm.tsx — A controlled form component:
   - Props: { value: PetFormData, onChange: (data: PetFormData) => void }
   - Fields: name (text input), species (select: Dog/Cat/Rabbit/Bird/Other), breed (text), age (text), sex (select: Male/Female/Unknown), temperament (multi-select checkboxes from the list: Friendly, Shy, Playful, Calm, Energetic, Gentle, Independent, Affectionate), shelterName (text), shelterContact (text), shelterLocation (text)
   - Style using the existing CSS design system (warm cream bg, warm border, navy headings, pill buttons). Use CSS classes in App.css, add a new section for form styles.
   - Group fields logically: Pet Info (name, species, breed, age, sex) → Temperament → Shelter Info

3. src/components/upload/PhotoDropZone.tsx — A drop zone that triggers the Cloudinary Upload Widget:
   - Props: { assets: UploadedAsset[], onUpload: (asset: UploadedAsset) => void, onRemove: (publicId: string) => void, maxPhotos?: number }
   - Shows uploaded photo thumbnails in a grid with remove buttons
   - Shows the Cloudinary Upload Widget button (use the existing UploadWidget component)
   - Displays upload count "3 / 10 photos"
   - Thumbnail grid shows small previews using Cloudinary thumbnail URLs: `https://res.cloudinary.com/dp498emx3/image/upload/c_fill,w_150,h_150,g_auto/f_auto,q_auto/{publicId}`
   - Style the drop zone with dashed border that turns gold on hover (existing .upload-placeholder style)

4. src/pages/UploadPage.tsx — Wire it all together:
   - Local state for PetFormData and UploadedAsset[]
   - Render PetForm and PhotoDropZone side by side (form on left, photos on right) on desktop, stacked on mobile
   - Add a "Create Campaign" submit button (disabled until name + at least 1 photo)
   - On submit: just console.log the data for now (we'll wire the real flow next)
   - Add the new layout CSS to App.css

Follow the design system in CLAUDE.md: warm tones, navy headings, gold primary buttons, 8/12/20px border radii, Figtree font. Form inputs should have warm border (#e8dfd3), 8px border-radius, and focus state with gold outline.
```

---

## Prompt 5: Upload Flow — Metadata Attachment & Hero Selection

```
Build the complete upload flow that stores pet data as Cloudinary metadata and selects the best hero photo. Create/modify:

1. src/utils/petId.ts — Generate a unique pet ID:
   - Export function generatePetId(): string — returns a UUID v4 (use crypto.randomUUID())

2. src/api/cloudinaryProxy.ts — Fetch helpers for the Express server:
   - Export async function signUpload(folder: string, metadata: Record<string, string>): Promise<SignResponse>
   - Export async function tagHero(publicId: string): Promise<void>
   - Export async function fetchPets(): Promise<Pet[]>
   - Export async function fetchPet(petId: string): Promise<Pet | null>
   - Base URL: "http://localhost:3001/api"

3. server/src/routes/pets.ts — Pet data endpoints:
   - GET /api/pets — Use Cloudinary Search API: cloudinary.search.expression('folder:pawprint/pets/* AND metadata.pawprint_pet_id:*').with_field('metadata').with_field('tags').sort_by('created_at','desc').max_results(30).execute()
     - Group results by pawprint_pet_id
     - For each group, return a Pet object with the first asset's metadata, hero image (tagged "hero"), and all gallery URLs
   - GET /api/pets/:id — Same but filtered: expression includes `metadata.pawprint_pet_id=<id>`

4. server/src/routes/tag-hero.ts — POST /api/tag-hero:
   - Accepts { publicId: string }
   - Calls cloudinary.uploader.add_tag('hero', [publicId])
   - Returns success

5. src/hooks/useUploadFlow.ts — Custom hook orchestrating the full flow:
   - Takes PetFormData + UploadedAsset[] as inputs
   - Returns { submit: () => Promise<string>, isSubmitting: boolean, error: string | null }
   - On submit:
     a. Generate a pet ID via generatePetId()
     b. The photos are already uploaded to Cloudinary (via the Upload Widget with signed uploads + metadata from Prompt 3). So this hook just needs to:
     c. Select the hero photo: pick the asset with the highest qualityScore (from quality_analysis returned by Cloudinary), or the first photo if no scores
     d. Call POST /api/tag-hero with the hero's publicId
     e. Return the pet ID so the page can navigate to /pet/:id

6. src/pages/UploadPage.tsx — Update to use the full flow:
   - On form submit, call the useUploadFlow hook
   - Pass metadata to the UploadWidget so each upload includes pet info
   - On success, navigate to /pet/:petId using useNavigate()
   - Show a loading spinner during submission
   - Generate the petId at the start (when the page loads) so all uploads share the same pet ID and folder (pawprint/pets/<petId>/)

7. src/cloudinary/UploadWidget.tsx — Ensure the widget passes back quality_analysis data:
   - Add `quality_analysis: true` to the widget config so Cloudinary returns quality scores
   - Map the result to include qualityScore from result.info.quality_analysis?.focus or null

Mount the new routes in server/src/index.ts.
```

---

## Prompt 6: Cloudinary Transformation URL Builders

```
Create the Cloudinary transformation URL builder helpers used throughout the app. Create:

src/cloudinary/transformations.ts

Using the @cloudinary/url-gen SDK (already installed), export these functions. Each takes a publicId (string) and returns a delivery URL string using the `cld` instance from config.ts:

1. heroUrl(publicId: string): string
   - Transformations: c_fill, w_800, h_600, g_auto → e_improve → f_auto, q_auto

2. thumbnailUrl(publicId: string): string
   - c_fill, w_300, h_300, g_auto → f_auto, q_auto

3. socialCardUrl(publicId: string, petName: string, breed: string): string
   - c_fill, w_1200, h_630, g_auto → e_improve → text overlay with pet name and breed (white text, navy background strip at bottom) → f_auto, q_auto
   - Use l_text: style overlay. Font: Arial, size 48 bold for name, size 28 for breed. Position: gravity south, y_40

4. platformUrl(publicId: string, platform: 'instagram_feed' | 'instagram_story' | 'twitter' | 'facebook' | 'youtube_thumb'): string
   - instagram_feed: c_fill, w_1080, h_1080, g_auto
   - instagram_story: c_fill, w_1080, h_1920, g_auto
   - twitter: c_fill, w_1200, h_675, g_auto
   - facebook: c_fill, w_1200, h_630, g_auto
   - youtube_thumb: c_fill, w_1280, h_720, g_auto
   - All with: e_improve → f_auto, q_auto

5. galleryUrl(publicId: string): string
   - c_fill, w_600, h_400, g_auto → f_auto, q_auto

Also create src/types/platform.ts:
- Export type PlatformKey = 'instagram_feed' | 'instagram_story' | 'twitter' | 'facebook' | 'youtube_thumb'
- Export interface PlatformSpec { key: PlatformKey, label: string, width: number, height: number, description: string }
- Export const PLATFORMS: PlatformSpec[] with all five platforms

Use the @cloudinary/url-gen SDK pattern:
- import { cld } from './config'
- import { fill } from '@cloudinary/url-gen/actions/resize'
- import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity'
- import { format, quality } from '@cloudinary/url-gen/actions/delivery'
- import { auto as autoFormat } from '@cloudinary/url-gen/qualifiers/format'
- import { auto as autoQuality } from '@cloudinary/url-gen/qualifiers/quality'
- import { improve } from '@cloudinary/url-gen/actions/adjust'
- import { source } from '@cloudinary/url-gen/actions/overlay'
- import { text } from '@cloudinary/url-gen/qualifiers/source'
- import { TextStyle } from '@cloudinary/url-gen/qualifiers/textStyle'
- cld.image(publicId).resize(fill().width(800).height(600).gravity(autoGravity())).adjust(improve()).delivery(format(autoFormat())).delivery(quality(autoQuality())).toURL()

Check .cursorrules in the project root for any Cloudinary SDK-specific import paths.
```

---

## Prompt 7: Gallery Page — Fetch & Display Pets

```
Build the gallery page that fetches pets from the Cloudinary Search API (via Express) and displays them as cards. Create/modify:

1. src/hooks/usePets.ts — Fetch all pets:
   - Uses fetchPets() from src/api/cloudinaryProxy.ts
   - Returns { pets: Pet[], loading: boolean, error: string | null, refresh: () => void }
   - Fetches on mount

2. src/components/pet/PetCard.tsx — Individual pet card:
   - Props: { pet: Pet }
   - Shows hero image (use heroUrl() or thumbnailUrl() from transformations.ts with the pet's hero publicId, fall back to first publicId)
   - Pet name (h3, navy, bold)
   - Breed + age subtitle
   - Species badge (small pill)
   - Temperament tags (small colored pills — gold bg for first 3)
   - "View Profile" link to /pet/:id
   - Card style: white bg, warm border, 20px border-radius, hover lift + shadow (match existing .feature-card hover behavior)

3. src/pages/GalleryPage.tsx — Replace the empty state placeholder:
   - Use usePets hook
   - Loading state: show 6 skeleton placeholder cards (gray shimmer boxes)
   - Empty state: keep the existing empty state UI with "Create a Campaign" CTA
   - Populated state: CSS grid of PetCards (3 columns desktop, 2 tablet, 1 mobile)
   - Add a filter/search bar at the top: species filter dropdown (All, Dog, Cat, Rabbit, Bird, Other) — client-side filtering
   - Add the gallery grid CSS to App.css

4. App.css — Add styles for:
   - .pet-card (white bg, border, rounded, overflow hidden)
   - .pet-card-image (aspect-ratio: 4/3, object-fit: cover, width: 100%)
   - .pet-card-body (padding)
   - .pet-card-tags (flex wrap, gap)
   - .tag (small pill: 0.75rem font, padding 0.2rem 0.65rem, border-radius full, font-weight 600)
   - .tag--species (teal bg soft, teal text)
   - .tag--temperament (gold bg soft, navy text)
   - .gallery-grid (CSS grid, 3 cols, 1.5rem gap)
   - .gallery-filters (flex, gap, margin-bottom)
   - .skeleton-card (animated shimmer placeholder)
   - Responsive: 2 cols at 768px, 1 col at 480px

Keep the warm design system. Cards should feel inviting — the pet image should be prominent.
```

---

## Prompt 8: Pet Profile Page

```
Build the full pet profile page that displays a pet's campaign with hero image, gallery, details, and sharing. Create/modify:

1. src/hooks/usePet.ts — Fetch a single pet:
   - Takes petId as parameter
   - Uses fetchPet() from cloudinaryProxy.ts
   - Returns { pet: Pet | null, loading: boolean, error: string | null }

2. src/components/pet/PetHero.tsx — Hero image section:
   - Props: { publicId: string, petName: string }
   - Large hero image using heroUrl() transformation
   - Use the @cloudinary/react AdvancedImage component: import { AdvancedImage } from '@cloudinary/react'
   - Pet name overlay at bottom-left (CSS positioned, not Cloudinary overlay — so it's responsive)
   - Rounded corners, subtle shadow

3. src/components/pet/PetGallery.tsx — Photo gallery grid:
   - Props: { publicIds: string[] }
   - Grid of gallery images using galleryUrl() transformation
   - Clicking an image opens a simple lightbox (modal with larger image, close on click/escape)
   - 3 columns on desktop, 2 on mobile

4. src/components/pet/PetDetails.tsx — Pet info card:
   - Props: { pet: Pet }
   - Displays: species, breed, age, sex in a 2x2 info grid
   - Temperament tags as colored pills
   - Shelter info section: name, contact, location
   - "I'm Interested" CTA button (links to mailto: shelterContact if it's an email, or just displays the contact)
   - Status badge (Available = teal, Pending = gold, Adopted = coral)

5. src/components/pet/ShareButton.tsx — Share/copy link:
   - Props: { petId: string }
   - Button that copies the pet profile URL to clipboard (window.location.origin + /#/pet/ + petId)
   - Shows "Copied!" feedback for 2 seconds after click
   - Also show native share dialog on mobile (navigator.share API with fallback)

6. src/pages/PetProfilePage.tsx — Assemble the full profile:
   - Use usePet hook with useParams id
   - Loading state: skeleton placeholders
   - Error state: "Pet not found" with link back to gallery
   - Layout: PetHero (full width) → two columns below: PetDetails (left, wider) + sidebar (right) with ShareButton, QR code placeholder, and "Download Campaign Pack" link to /pet/:id/download
   - Add AI caption display if pet.caption exists (styled blockquote)

7. App.css — Add styles for:
   - .pet-hero-container (position relative, border-radius 20px, overflow hidden, max-height 500px)
   - .pet-hero-overlay (absolute positioned name at bottom)
   - .pet-gallery-grid (3 cols, gap)
   - .pet-details-grid (2x2 grid for info items)
   - .pet-info-item (label + value stacked)
   - .pet-profile-layout (two-column below hero)
   - .pet-sidebar (sticky top)
   - .lightbox (fixed overlay, centered image, backdrop blur)
   - .status-badge variants
   - Responsive breakpoints

Follow the warm shelter aesthetic. The hero image should be the focal point. Use navy for headings, gold for CTAs, teal for status badges.
```

---

## Prompt 9: AI Captions via Google Gemini

```
Add AI-generated adoption captions using Google Gemini, proxied through the Express server. Create/modify:

1. server/src/services/gemini.ts — Gemini API wrapper:
   - Uses fetch to call the Gemini API (no SDK needed)
   - Endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}
   - Export async function generateCaption(petData: { name, species, breed, age, sex, temperament: string[] }): Promise<string>
   - Prompt: "Write a warm, engaging adoption caption for a social media post about a shelter pet. The caption should be 2-3 sentences, highlight the pet's personality, and include a call to action. Do not use hashtags. Pet details: Name: {name}, Species: {species}, Breed: {breed}, Age: {age}, Sex: {sex}, Temperament: {temperament.join(', ')}. Return only the caption text, nothing else."
   - Add GEMINI_API_KEY to server/.env (placeholder value)

2. server/src/routes/caption.ts — POST /api/caption:
   - Accepts pet data in the body
   - Calls generateCaption()
   - Returns { caption: string }
   - Error handling: return 500 with message if Gemini fails

3. Mount the caption route in server/src/index.ts

4. src/api/gemini.ts — Client-side wrapper:
   - Export async function generateCaptionForPet(petData: PetFormData): Promise<string>
   - Calls POST http://localhost:3001/api/caption with the pet data
   - Returns the caption string

5. src/hooks/useCaption.ts — Caption generation hook:
   - Takes pet data as input
   - Returns { caption: string | null, loading: boolean, error: string | null, generate: () => Promise<void> }
   - Does NOT auto-generate — only on explicit generate() call

6. Update src/pages/UploadPage.tsx:
   - After successful upload flow (before or after navigation), offer a "Generate AI Caption" button
   - Actually, better UX: add a step between form completion and final submission. After photos are uploaded and form is filled, show a preview step with a "Generate Caption" button. Display the generated caption in an editable textarea. Include it in the metadata when submitting.

7. Update src/pages/PetProfilePage.tsx:
   - If the pet has no caption, show a "Generate Caption" button (calls the API)
   - Display the caption in a styled blockquote card with a subtle gold left border

8. server/src/routes/pets.ts — Add a PATCH endpoint or update the caption route to save the caption back to Cloudinary metadata:
   - POST /api/pets/:id/caption — takes { caption: string }, updates all assets with that pet_id to include the caption metadata via cloudinary.api.update(publicId, { metadata: { pawprint_caption: caption } })
```

---

## Prompt 10: Download Page — Platform Campaign Packs

```
Build the download page that generates platform-specific ZIP files with optimized images and captions. Install JSZip and file-saver first (I'll handle this). Create/modify:

1. src/utils/platformSpecs.ts — (may already exist from Prompt 6, merge if needed):
   - Export the PLATFORMS array and PlatformSpec type
   - Add a function getFilenameForPlatform(petName: string, platform: PlatformKey, index: number): string
     e.g., "Buddy_instagram_feed_1.jpg"

2. src/hooks/useDownloadPack.ts — Download pack generation:
   - Takes pet: Pet as input
   - Returns { downloadPlatform: (platform: PlatformKey) => Promise<void>, downloadAll: () => Promise<void>, progress: number, isGenerating: boolean }
   - For a single platform download:
     a. For each pet photo publicId, generate the platformUrl() for that platform
     b. Fetch each image as a blob (the Cloudinary URLs are publicly accessible CDN URLs)
     c. Create a JSZip instance
     d. Add each image blob to the ZIP with proper filenames
     e. Add a caption.txt file with the pet's caption + shelter info
     f. Generate the ZIP and trigger download via file-saver's saveAs()
     g. Name the ZIP: "{PetName}_{Platform}.zip"
   - For downloadAll: create one ZIP with subfolders per platform
   - Track progress as percentage (images fetched / total images)

3. src/components/campaign/PlatformPack.tsx — Platform download card:
   - Props: { pet: Pet, platform: PlatformSpec, onDownload: () => void, isGenerating: boolean }
   - Shows: platform icon/name, dimensions, description
   - Preview: show the first pet photo in that platform's aspect ratio (use platformUrl())
   - Download button per platform
   - Style: card with platform-specific accent color

4. src/components/campaign/CaptionCard.tsx — Caption display + copy:
   - Props: { caption: string, petName: string }
   - Shows the AI caption in a styled card
   - "Copy Caption" button that copies to clipboard
   - Character count shown (useful for platform limits)

5. src/components/campaign/SocialPreview.tsx — Preview mockup:
   - Props: { pet: Pet, platform: PlatformKey }
   - Shows what the post would roughly look like on that platform
   - Simple mock frame (e.g., Instagram post frame with image + caption below)
   - Use platformUrl() for the image

6. src/pages/DownloadPage.tsx — Full download page:
   - Use usePet hook to fetch the pet data
   - Use useDownloadPack hook for downloads
   - Layout:
     - Header with pet name + "Campaign Pack"
     - Caption card at top (with copy button)
     - Grid of PlatformPack cards (one per platform)
     - "Download All Platforms" button (generates one big ZIP)
     - Link back to pet profile
   - Loading states and progress bar during ZIP generation
   - Add responsive CSS to App.css

7. App.css — Add styles for:
   - .download-grid (grid of platform cards)
   - .platform-card (card with preview image, info, download button)
   - .platform-preview (aspect-ratio container showing the image)
   - .caption-card (gold left border, warm bg)
   - .progress-bar (gold fill, animated)
   - .social-preview-frame (mock social media frame)

Important: When fetching images for ZIP, use fetch() on the Cloudinary CDN URLs. These are public URLs that return the transformed images. Handle CORS — Cloudinary CDN URLs should work fine with fetch from the browser.
```

---

## Prompt 11: QR Codes & Kennel Cards

```
Add QR code generation and printable kennel cards. Install qrcode.react first (I'll handle this). Create/modify:

1. src/components/campaign/QRCodeCard.tsx — QR code display:
   - Props: { petId: string, petName: string }
   - Generates a QR code pointing to the pet profile URL (window.location.origin + /#/pet/ + petId)
   - Uses qrcode.react's QRCodeSVG component
   - QR code size: 200x200
   - Foreground color: var(--color-navy) (#002b60)
   - Shows the URL text below the QR code
   - "Download QR" button that saves the QR as PNG (render to canvas, toBlob, download)
   - Style: centered in a white card with border

2. src/components/campaign/KennelCard.tsx — Printable kennel card:
   - Props: { pet: Pet }
   - A print-optimized card (A5 size, landscape) containing:
     - PawPrint logo (small, top-left)
     - Pet's hero photo (large, left side)
     - Pet name (large, bold)
     - Breed, age, sex
     - Temperament tags
     - QR code (bottom-right) linking to the profile
     - Shelter name and contact
     - "Scan to learn more!" text near QR code
   - "Print Kennel Card" button that triggers window.print() with a print-specific stylesheet
   - Add @media print CSS that:
     - Hides everything except the .kennel-card
     - Sets the page to landscape A5
     - Removes backgrounds/shadows for clean printing

3. Update src/pages/PetProfilePage.tsx:
   - Add QRCodeCard in the sidebar (below ShareButton)
   - Add "Print Kennel Card" button in the sidebar

4. Update src/pages/DownloadPage.tsx:
   - Add QRCodeCard section
   - Add KennelCard preview with print button

5. App.css — Add styles for:
   - .qr-card (centered, white bg, padding)
   - .kennel-card (fixed dimensions for A5, clean print layout)
   - .kennel-card-grid (two-column: photo left, info right)
   - @media print styles
```

---

## Prompt 12: Upload Page Polish — Preview Step & Multi-Step Flow

```
Refine the upload page into a smooth multi-step wizard experience. Modify:

1. src/pages/UploadPage.tsx — Convert to a 3-step flow:
   - Step 1: "Pet Details" — PetForm component (name, species, breed, age, sex, temperament, shelter info)
   - Step 2: "Upload Photos" — PhotoDropZone + preview thumbnails (3-10 photos, show quality scores if available)
   - Step 3: "Review & Submit" — Preview card showing: hero photo (auto-selected, highest quality score), pet details summary, AI caption (with "Generate" button + editable textarea), "Create Campaign" submit button

   - Step indicator at top (3 circles connected by lines, active step highlighted in gold, completed steps in teal with checkmark)
   - "Next" / "Back" buttons for navigation between steps
   - Validation per step:
     - Step 1: name required
     - Step 2: at least 1 photo required
     - Step 3: no additional requirements
   - On final submit: run the upload flow, show loading state, navigate to pet profile

2. src/components/upload/UploadProgress.tsx — Upload progress indicator:
   - Props: { current: number, total: number, currentFile?: string }
   - Shows progress bar + "Uploading 3/7 photos..." text
   - Animated gold progress bar

3. src/components/upload/StepIndicator.tsx — Step progress:
   - Props: { currentStep: number, steps: string[] }
   - Horizontal step indicator with circles and connecting lines
   - Active: gold circle, bold text
   - Completed: teal circle with checkmark
   - Upcoming: gray circle, muted text

4. App.css — Add styles for:
   - .wizard-container (max-width 800px, centered)
   - .step-indicator (flex, horizontal, connecting lines)
   - .step-circle (32px, border-radius full, centered number/checkmark)
   - .step-circle--active (gold bg, white text)
   - .step-circle--completed (teal bg, white checkmark)
   - .step-circle--upcoming (border only, gray)
   - .step-connector (line between circles)
   - .wizard-nav (flex, space-between, Next/Back buttons)
   - .review-preview (card showing hero + summary)
   - .upload-progress (progress bar container)
   - Transitions between steps (subtle fade/slide)
```

---

## Prompt 13: Error Handling, Loading States & Edge Cases

```
Add robust error handling, loading states, and edge case coverage across the app. Modify these files:

1. src/components/ui/ErrorBanner.tsx — Reusable error display:
   - Props: { message: string, onRetry?: () => void, onDismiss?: () => void }
   - Red-tinted banner with error icon, message text, optional retry button
   - Style: coral-soft bg, coral border-left, coral text

2. src/components/ui/LoadingSkeleton.tsx — Reusable skeleton loader:
   - Props: { variant: 'card' | 'text' | 'image' | 'circle', width?: string, height?: string }
   - Animated shimmer effect (CSS gradient animation)
   - Warm gray color matching the design system

3. src/components/ui/EmptyState.tsx — Reusable empty state:
   - Props: { icon?: ReactNode, title: string, description: string, action?: { label: string, to: string } }
   - Centered layout with muted icon, text, and optional CTA button

4. Update all pages with proper error boundaries:
   - GalleryPage: handle API fetch failure, show ErrorBanner with retry
   - PetProfilePage: handle pet not found (404), show "Pet not found" with back link
   - DownloadPage: handle missing pet, handle ZIP generation failure
   - UploadPage: handle upload failures per-photo (allow retry), handle sign endpoint being down

5. Update hooks with error recovery:
   - usePets: add refresh/retry function
   - usePet: handle 404 distinctly from network errors
   - useUploadFlow: handle partial upload failure (some photos succeed, some fail)
   - useDownloadPack: handle individual image fetch failure (skip failed images, warn user)
   - useCaption: handle Gemini API failure gracefully (show "Caption unavailable" with retry)

6. Add network status awareness:
   - Show a subtle offline banner when navigator.onLine is false
   - Disable upload/download buttons when offline

7. App.css — Add styles for:
   - .error-banner (coral accent, icon, message, buttons)
   - .skeleton (animated shimmer)
   - .empty-state (centered, muted)
   - .offline-banner (yellow/gold warning bar at top)

Keep error messages user-friendly — "Something went wrong. Please try again." not raw error strings. Log technical details to console.
```

---

## Prompt 14: Final Polish — Responsive, Accessibility & Performance

```
Final polish pass for demo readiness. Modify existing files:

1. Responsive design audit — Update App.css:
   - Test and fix all pages at 320px, 480px, 768px, 1024px, 1440px breakpoints
   - Navbar: add a hamburger menu for mobile (collapsible nav links)
   - Upload wizard: full-width steps on mobile, no side-by-side layout below 768px
   - Gallery: 1 col at 480px, 2 cols at 768px, 3 cols at 1024px+
   - Pet profile: single column on mobile, stack sidebar below main content
   - Download page: single column platform cards on mobile
   - Kennel card: scale down for mobile preview (full size only on print)

2. Accessibility:
   - Add aria-labels to all icon-only buttons (share, download, remove photo)
   - Add alt text to all images (use pet name + "photo" or "hero image")
   - Ensure form labels are properly associated with inputs (htmlFor + id)
   - Add keyboard navigation: all interactive elements focusable, visible focus rings (gold outline)
   - Add role="alert" to error banners
   - Ensure color contrast meets WCAG AA for all text

3. Performance:
   - Add loading="lazy" to gallery images
   - Use @cloudinary/react AdvancedImage with responsive and placeholder plugins where applicable
   - Debounce the species filter on gallery page (300ms)
   - Memoize transformation URL generation with useMemo where called in loops

4. Micro-interactions:
   - Smooth page transitions (CSS fade on route change — use a wrapper component)
   - Button press feedback (scale down slightly on :active)
   - Photo upload: subtle scale-in animation when new thumbnails appear
   - Success states: brief checkmark animation after upload completes
   - Toast notification component for copy-to-clipboard confirmations instead of inline "Copied!" text

5. Meta & SEO:
   - Update index.html <title> to "PawPrint — Shelter Pet Adoption Campaigns"
   - Add meta description
   - Add Open Graph tags for social sharing (og:title, og:description, og:image using a static preview image)

6. Final CSS cleanup in App.css:
   - Ensure no duplicate rules
   - Organize by component section with clear comment headers
   - Remove any unused styles
```

---

## Prompt 15: QR Code System — Unique Hosted Pet Profiles on Vercel

```
Design and implement the full QR code → hosted profile system for PawPrint. The goal: every pet gets a permanent, unique URL that lives on our Vercel deployment. A QR code encodes that URL. Anyone — adopters, volunteers, visitors — scans the QR code and instantly sees a rich online profile for that pet. The QR code IS the pet's online identity.

### System Architecture

**How each pet gets a unique online profile:**

1. **UUID generation at upload time**
   - When a volunteer uploads a pet, `crypto.randomUUID()` generates a unique ID (e.g., `a3f1b2c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c`)
   - This ID is stored as `pawprint_pet_id` in Cloudinary Structured Metadata on every photo for that pet
   - The ID is permanent — it never changes, so the QR code URL never breaks

2. **Profile URL format**
   - Production: `https://pawprint-app.vercel.app/#/pet/a3f1b2c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c`
   - Dev: `http://localhost:5173/#/pet/a3f1b2c4-...`
   - Uses HashRouter (`/#/`) so the URL works on any static host without server-side rewrites
   - The URL is the pet's permanent online address — bookmarkable, shareable, scannable

3. **How pet data is "stored" without a database**
   - All pet data (name, breed, age, photos, caption, shelter info) is stored as Cloudinary Structured Metadata on the uploaded images
   - When someone visits the profile URL, the React SPA calls `GET /api/pets/:id` on our Express server
   - The Express server queries Cloudinary Search API: `metadata.pawprint_pet_id="<uuid>"`
   - Cloudinary returns all assets (photos) for that pet, each carrying the full metadata
   - The frontend reconstructs the profile from this metadata — name, breed, temperament, gallery, hero image, caption, shelter details
   - This means Cloudinary IS the database. The profile page is dynamically rendered from Cloudinary data on every visit

### Implementation Steps

**A. Environment & Config**

- Add `VITE_APP_URL` to `.env.production` → set to the Vercel deployment URL (e.g., `https://pawprint-app.vercel.app`)
- Add `VITE_APP_URL` to `.env` → default to empty string (code will fall back to `window.location.origin`)
- Create a helper `src/utils/profileUrl.ts`:
  ```ts
  export function getProfileUrl(petId: string): string {
    const base = import.meta.env.VITE_APP_URL || window.location.origin;
    return `${base}/#/pet/${petId}`;
  }
  ```
- Use `getProfileUrl()` everywhere that builds a pet link — QR code, share button, copy link, kennel card

**B. QR Code Component (`src/components/campaign/QRCodeCard.tsx`)**

- Import `QRCodeSVG` and `QRCodeCanvas` from `qrcode.react`
- Display: render `<QRCodeSVG>` with the profile URL, size 200, fgColor `#002b60` (navy)
- Download: render a hidden `<QRCodeCanvas>` at 512x512 (high-res for print), call `canvas.toDataURL('image/png')`, trigger download via file-saver
- Copy link: `navigator.clipboard.writeText(profileUrl)` with "Copied!" feedback
- Pet name label above QR code, "Scan to meet {name}!" below
- Styled as a card matching the design system (warm cream bg, warm border, 12px radius)

**C. QR Code in the Download ZIP Pack**

- In `useDownloadPack.ts`, when generating the ZIP:
  - Render a QR code canvas programmatically (offscreen)
  - Export as PNG blob
  - Add `qr-code.png` to the ZIP alongside the platform images
  - Add `profile-link.txt` containing the full profile URL
- This way, volunteers who download the campaign pack get a print-ready QR code file

**D. Vercel Deployment Strategy**

Option 1 — Split deployment (simpler):
- Deploy the React SPA (`npm run build` → `dist/`) to Vercel as a static site
- Deploy the Express server separately (Railway, Render, or Vercel Serverless)
- Set `VITE_API_URL` in Vercel's env vars to point to the deployed Express server
- CORS on Express must allow the Vercel domain

Option 2 — Monorepo on Vercel (recommended for hackathon):
- Convert Express routes to Vercel Serverless Functions under `api/` directory
- File structure:
  ```
  PawPrint/
  ├── api/
  │   ├── sign-upload.ts    → POST /api/sign-upload
  │   ├── caption.ts        → POST /api/caption
  │   ├── pets/
  │   │   ├── index.ts      → GET /api/pets
  │   │   └── [id].ts       → GET /api/pets/:id
  │   └── tag-hero.ts       → POST /api/tag-hero
  ├── src/                   (React SPA — unchanged)
  ├── dist/                  (build output)
  └── vercel.json
  ```
- `vercel.json`:
  ```json
  {
    "buildCommand": "npm run build",
    "outputDirectory": "dist",
    "rewrites": [
      { "source": "/api/(.*)", "destination": "/api/$1" }
    ]
  }
  ```
- No CORS issues — everything is on the same domain
- Serverless functions auto-scale, no always-on server needed
- Environment variables (CLOUDINARY_URL, GEMINI_API_KEY) set in Vercel dashboard → Settings → Environment Variables

**E. Making the QR Code a "Permanent Profile"**

The key insight: the QR code URL never changes because:
- The pet UUID is generated once at upload and stored in Cloudinary metadata
- The Vercel URL is stable (custom domain or `.vercel.app` subdomain)
- HashRouter means the URL works without any server routing config
- Cloudinary stores the data indefinitely (free tier has no expiry)

So printing a QR code on a kennel card, flyer, or social post creates a permanent link to that pet's profile. Even if the pet gets adopted, the profile stays — the status just changes to "Adopted" in the metadata.

To make profiles even more permanent/shareable:
- Consider adding Open Graph meta tags dynamically (would require SSR or a serverless function that serves custom HTML per pet)
- For hackathon scope: OG tags can be static (same preview for all links) and the actual profile loads client-side via HashRouter

**F. Where QR Codes Appear in the App**

| Location | Purpose |
|---|---|
| `PetProfilePage` sidebar | Volunteer grabs QR for that pet |
| `DownloadPage` | QR code PNG included in the ZIP pack |
| `KennelCard` (print) | QR printed on the physical kennel card |
| `GalleryPage` (optional) | Small QR icon on each pet card for quick access |

### Summary

The QR code system works because of three things that are already in place:
1. **Unique IDs** — every pet gets a UUID stored in Cloudinary metadata
2. **Dynamic profiles** — the React SPA fetches and renders pet data from Cloudinary on demand
3. **Static hosting** — HashRouter + Vercel means the URL works anywhere, no server routing needed

The QR code is just a scannable encoding of the URL. The "online profile" is the existing `/#/pet/:id` page. No extra database, no extra hosting, no extra storage needed. Cloudinary is the source of truth, Vercel serves the static SPA, and the QR code bridges the physical world (kennel cards, flyers) to the digital profile.
```

---

## Quick Reference: Install Commands

Run these as you reach each prompt:

```bash
# Before Prompt 1 (server setup)
cd PawPrint/server && npm install

# Before Prompt 2 (after server package.json is created)
cd PawPrint/server && npm install

# Before Prompt 10 (download packs)
cd PawPrint && npm install jszip file-saver && npm install -D @types/file-saver

# Before Prompt 11 (QR codes)
cd PawPrint && npm install qrcode.react
```

## Quick Reference: Running the App

```bash
# Terminal 1 — Frontend
cd PawPrint && npm run dev

# Terminal 2 — Backend
cd PawPrint/server && npm run dev

# One-time — Setup Cloudinary metadata fields
cd PawPrint/server && npm run setup-metadata
```
