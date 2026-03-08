# PawPrint

**Turn shelter photos into polished, shareable adoption campaigns in minutes.**

PawPrint helps shelter volunteers upload pet photos, fill in details, generate AI-powered captions, and download platform-optimized image packs ready to post on social media.

## Features

- **3-step upload wizard** — Enter pet details, upload photos/videos, review and submit
- **AI-generated captions** — Powered by Google Gemini, tailored per social platform
- **Platform-optimized downloads** — One-click ZIP packs sized for Instagram, Twitter, Facebook, YouTube
- **Smart hero selection** — Automatically picks the best photo using Cloudinary quality analysis
- **No database required** — Cloudinary metadata is the database
- **QR codes & kennel cards** — Printable assets generated for each pet
- **Video support** — Upload and download videos alongside photos

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Routing | React Router v7 (HashRouter) |
| Backend | Vercel Serverless Functions |
| Image/Video Management | Cloudinary (SDK, Upload Widget, Transformations) |
| AI Captions | Google Gemini 2.0 Flash |
| Downloads | JSZip + file-saver (client-side ZIP) |
| QR Codes | qrcode.react |

## Project Structure

```
PawPrint/
├── src/                        # Frontend (React + Vite)
│   ├── pages/                  # Route pages (Home, Upload, Gallery, PetProfile, Download)
│   ├── components/             # UI components (layout, upload, pet, campaign, ui)
│   ├── hooks/                  # Custom hooks (usePet, usePets, useUploadFlow, useCaption, useDownloadPack, etc.)
│   ├── api/                    # Frontend API clients (cloudinaryProxy, gemini)
│   ├── cloudinary/             # Cloudinary config, Upload Widget, transformation URL builders
│   ├── types/                  # TypeScript interfaces (Pet, Platform)
│   └── utils/                  # Helpers (petId, platformSpecs, profileUrl)
├── api/                        # Backend (Vercel Serverless Functions)
│   ├── _lib/                   # Shared backend modules (cloudinary, gemini, pets)
│   ├── pets/                   # Pet CRUD endpoints
│   ├── caption.ts              # General caption generation
│   ├── platform-captions.ts    # Platform-specific caption generation
│   ├── tag-hero.ts             # Hero image tagging
│   └── health.ts               # Health check
└── vercel.json                 # Build config + API rewrites
```

## How It Works

### User Flow

1. **Home** (`/`) — Landing page with CTAs to start a campaign or browse existing pets
2. **Upload** (`/upload`) — 3-step wizard:
   - **Step 1:** Fill in pet details (name, species, breed, age, sex, temperament, shelter info)
   - **Step 2:** Upload photos and videos via the Cloudinary widget; each asset gets AI quality analysis and photo tips
   - **Step 3:** Review uploads, select a hero image, generate/edit an AI caption, then submit
3. **Pet Profile** (`/pet/:id`) — Full profile page with hero image, details, photo gallery, AI caption, share button, QR code, kennel card, and download link
4. **Download** (`/pet/:id/download`) — Platform-specific image packs with tailored captions, social previews, QR codes, and one-click ZIP downloads
5. **Gallery** (`/gallery`) — Browse all pets with species filtering

---

## Cloudinary Integration

Cloudinary serves a dual role: **media management** and **data storage**. There is no traditional database — all pet data lives as structured metadata on uploaded assets.

### Upload & Metadata Storage

When a volunteer uploads photos through the Cloudinary Upload Widget, each asset is stored in a folder (`pawprint/pets/{petId}/`) with metadata fields attached:

```
pawprint_pet_id         → UUID grouping all photos of the same pet
pawprint_pet_name       → Pet name
pawprint_species        → Species (dog, cat, rabbit, etc.)
pawprint_breed          → Breed
pawprint_age            → Age
pawprint_sex            → Sex
pawprint_temperament    → Comma-separated traits (friendly, playful, shy)
pawprint_vaccination    → Vaccination status
pawprint_spayed_neutered → Spay/neuter status
pawprint_shelter_name   → Shelter name
pawprint_shelter_contact → Contact info
pawprint_shelter_location → Location
pawprint_status         → Adoption status
pawprint_caption        → AI-generated caption (saved after generation)
```

The metadata string is encoded as pipe-separated key-value pairs and passed to the widget configuration, so every uploaded file automatically carries the full pet record.

### Hero Image Selection

Cloudinary's `quality_analysis.focus` score is extracted for each uploaded asset. The highest-scoring photo is automatically suggested as the hero image. Volunteers can override this manually. The selected hero is tagged with a `"hero"` tag via the `/api/tag-hero` endpoint, which is later used to sort assets so the hero appears first.

### Querying Pets (Cloudinary Search API)

Since there's no database, all pet queries go through the Cloudinary Search API:

- **List all pets:** Searches `folder:pawprint/pets/*` with metadata and tags, groups results by `pawprint_pet_id`
- **Get single pet:** Searches `folder:pawprint/pets/* AND metadata.pawprint_pet_id={id}`

The backend `groupToPets()` function takes raw Cloudinary resources, groups them by pet ID, extracts metadata into a structured `Pet` object, and identifies the hero image by tag.

### Image & Video Transformations

Cloudinary URL-based transformations resize and optimize assets on the fly. PawPrint uses the `@cloudinary/url-gen` SDK to build transformation URLs for different contexts:

| Context | Dimensions | Transformations |
|---|---|---|
| Hero image | 1200x800 | Auto-fill, auto-gravity, improve, best quality |
| Gallery grid | 900x600 | Auto-fill, auto-gravity, improve, best quality |
| Thumbnail | 300x300 | Auto-fill, auto-gravity, good quality |
| Lightbox | 1600x1200 | Auto-fill, auto-gravity, improve, best quality |
| Social card | 1200x630 | Auto-fill, text overlays (pet name + breed) |
| Platform-sized | Varies per platform | Auto-fill, auto-gravity, improve, best quality |

For **video assets**, transformations extract a JPG still frame for previews and thumbnails. When downloading, videos are kept in their original format (resized to platform dimensions) and saved as `.mp4` in the ZIP.

### Platform Dimensions

| Platform | Size | Key |
|---|---|---|
| Instagram Feed | 1080x1080 | `instagram_feed` |
| Instagram Story | 1080x1920 | `instagram_story` |
| Twitter | 1200x675 | `twitter` |
| Facebook | 1200x630 | `facebook` |
| YouTube Thumbnail | 1280x720 | `youtube_thumb` |

---

## Gemini AI Integration

PawPrint uses the Google Gemini 2.0 Flash API to generate captions and analyze uploaded photos. All AI calls are routed through Vercel serverless functions that hold the API key.

### General Caption Generation

When a volunteer finishes uploading photos, they can generate an AI caption from the pet's details (name, species, breed, age, sex, temperament). Gemini returns a warm, 2-3 sentence adoption-ready caption emphasizing personality and a call to action. This caption is editable before submission and is saved to Cloudinary metadata on all of the pet's assets.

### Platform-Specific Captions

On the download page, Gemini generates five tailored captions — one per social platform — each with platform-appropriate tone, length, and hashtags:

- **Instagram Feed** — Warm and emotional (2-3 sentences), 8-12 hashtags
- **Instagram Story** — Ultra-short punchy line (<80 chars), 3-5 hashtags
- **Twitter** — Witty and conversational, fits 280-char limit, 2-4 hashtags
- **Facebook** — Community-focused (3-4 sentences), 5-7 hashtags
- **YouTube Thumbnail** — Bold title text (<50 chars), no hashtags

Hashtags are a mix of high-volume discovery tags (e.g. #AdoptDontShop) and breed-specific niche tags, with different sets per platform.

### Photo Analysis & Tips

During upload, each photo can be analyzed by Gemini to provide:
- **Hero suitability** assessment for profile display
- **Enhancement suggestions** (lighting, contrast, focus adjustments)
- **Photo tips** — Actionable advice for better shelter photography

The image is resized to 800x600 and sent to Gemini as base64 inline data to reduce payload size. For videos, a JPG still frame is extracted first.

---

## Download Pack Generation

Downloads are generated entirely client-side using JSZip and file-saver. Each platform pack ZIP contains:

```
{PetName}_instagram_feed.zip
├── {PetName}_instagram_feed_1.jpg      # Platform-sized image
├── {PetName}_instagram_feed_2.mp4      # Video kept as video
├── caption.txt                          # Platform-specific caption + hashtags
├── qr-code.png                          # QR code linking to pet profile
└── profile-link.txt                     # Direct URL to pet profile
```

The "Download All Platforms" option creates a single ZIP with subfolders for each platform, plus a general caption, QR code, and profile link at the root.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/pets` | List all pets (Cloudinary search by folder) |
| GET | `/api/pets/:id` | Get single pet by `pawprint_pet_id` metadata |
| POST | `/api/pets/:id/caption` | Save caption to all of a pet's image metadata |
| POST | `/api/pets/:id/delete` | Delete all of a pet's assets from Cloudinary |
| POST | `/api/caption` | Generate a general AI caption via Gemini |
| POST | `/api/platform-captions` | Generate 5 platform-specific captions via Gemini |
| POST | `/api/analyze-image` | Analyze a photo with Gemini (quality, suggestions) |
| POST | `/api/photo-tips` | Get AI photo improvement tips |
| POST | `/api/tag-hero` | Add "hero" tag to a Cloudinary asset |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Cloudinary](https://cloudinary.com/) account
- A [Google Gemini API key](https://aistudio.google.com/apikey)

### Installation

```bash
git clone <repo-url>
cd PawPrint
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Frontend
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
VITE_API_URL=http://localhost:3001/api
VITE_APP_URL=http://localhost:5173

# Backend (set in Vercel dashboard for production)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
GEMINI_API_KEY=your_gemini_api_key
```

#### Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com/)
2. Find your cloud name in the [dashboard](https://console.cloudinary.com/app/home/dashboard)
3. Create an unsigned upload preset:
   - Go to **Settings > Upload > Upload Presets**
   - Click **Add upload preset**, set to **Unsigned** mode
   - Add the preset name to `VITE_CLOUDINARY_UPLOAD_PRESET`
4. Set up [structured metadata fields](https://cloudinary.com/documentation/dam_admin_structured_metadata) matching the `pawprint_*` keys listed above

#### Gemini Setup

1. Get an API key from [Google AI Studio](https://aistudio.google.com/apikey)
2. Set it as `GEMINI_API_KEY`

### Development

```bash
npm run dev         # Start Vite dev server (frontend)
npm run build       # TypeScript check + production build
npm run preview     # Preview production build
npm run lint        # ESLint check
```

### Deployment

PawPrint is designed for Vercel:

1. Push the repo to GitHub
2. Import the project in [Vercel](https://vercel.com/)
3. Set `CLOUDINARY_URL` and `GEMINI_API_KEY` as environment variables in the Vercel dashboard
4. Vercel automatically builds the frontend (`npm run build`) and deploys the `api/` directory as serverless functions

---

## Architecture Decisions

- **Cloudinary as database** — Eliminates the need for a separate database. Pet data is stored as structured metadata on each uploaded asset and queried via the Cloudinary Search API.
- **HashRouter** — Uses `/#/path` URLs for compatibility with static hosting and Vercel rewrites.
- **Client-side ZIP generation** — Downloads are built in the browser with JSZip, avoiding server-side compute for file packaging.
- **Serverless API** — Lightweight Vercel functions handle only what needs a secret (Cloudinary admin operations, Gemini API calls).
- **On-the-fly transformations** — Images are never pre-processed. Cloudinary generates platform-sized variants via URL parameters at request time.

## License

MIT
