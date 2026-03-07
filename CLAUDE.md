# PawPrint - Pet Adoption Campaign Generator

## What This Is
PawPrint lets shelter volunteers create optimized adoption campaigns in minutes. Upload pet photos + fill a form → get optimized images, shareable profiles, AI captions, and platform-ready download packs.

**Hackathon project** (HackCanada). Speed and demo-ability matter.

## Tech Stack
- **Frontend:** React 19 + Vite 6 + TypeScript (scaffolded via `create-cloudinary-react`)
- **Backend:** Express server on port 3001 (`/server` directory, separate `package.json`)
- **Media:** Cloudinary (free tier — 25 credits/mo, 10MB upload limit)
- **AI Captions:** Google Gemini API (proxied through Express)
- **Routing:** HashRouter (`#/pet/:id` — no server config needed)
- **Downloads:** JSZip + file-saver (client-side ZIP packaging)
- **QR Codes:** qrcode.react (client-side SVG rendering)

## Architecture

```
React SPA (port 5173)                  Express Server (port 3001)
  |- Upload Widget (direct to Cld)     |- POST /api/sign-upload (signatures)
  |- URL-based transforms (no server)  |- POST /api/caption (Gemini proxy)
  |- JSZip client-side packaging       |- GET  /api/pets (Search API proxy)
  |- HashRouter (#/pet/:id)            |- GET  /api/pets/:id
  |- qrcode.react (client-side QR)     |- POST /api/tag-hero
```

**No database.** Persistence via Cloudinary Structured Metadata (SMD) on assets. Pet data stored as metadata fields on uploaded images. Query via Cloudinary Search API (Admin API, proxied through Express).

## Project Structure
```
PawPrint/
├── src/
│   ├── main.tsx                    # HashRouter setup
│   ├── App.tsx                     # Route definitions
│   ├── cloudinary/
│   │   ├── config.ts               # Cloudinary instance (from starter kit)
│   │   ├── UploadWidget.tsx         # Modified for signed uploads + metadata
│   │   └── transformations.ts       # URL builder helpers
│   ├── api/
│   │   ├── cloudinaryProxy.ts       # Fetch helpers for Express endpoints
│   │   └── gemini.ts                # Caption API wrapper
│   ├── types/
│   │   ├── pet.ts                   # Pet, PetFormData, UploadedAsset
│   │   └── platform.ts             # Platform dimension specs
│   ├── hooks/
│   │   ├── usePets.ts, usePet.ts
│   │   ├── useUploadFlow.ts
│   │   ├── useCaption.ts
│   │   └── useDownloadPack.ts
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── UploadPage.tsx
│   │   ├── GalleryPage.tsx
│   │   ├── PetProfilePage.tsx
│   │   └── DownloadPage.tsx
│   ├── components/
│   │   ├── layout/ (Navbar, Footer)
│   │   ├── upload/ (PetForm, PhotoDropZone, UploadProgress)
│   │   ├── pet/ (PetCard, PetHero, PetGallery, PetDetails, ShareButton)
│   │   ├── campaign/ (CaptionCard, SocialPreview, PlatformPack, QRCodeCard)
│   │   └── ui/ (Button, Input, Select, etc.)
│   └── utils/
│       ├── fileValidation.ts
│       ├── petId.ts
│       └── platformSpecs.ts
├── server/
│   ├── package.json
│   ├── .env                         # CLOUDINARY_URL, GEMINI_API_KEY
│   └── src/
│       ├── index.ts                 # Express app (port 3001)
│       ├── routes/ (caption.ts, pets.ts, sign.ts)
│       └── services/ (cloudinary.ts, gemini.ts)
├── .env                             # VITE_CLOUDINARY_CLOUD_NAME (from starter kit)
└── .cursorrules                     # Cloudinary SDK patterns (from starter kit)
```

## Key Conventions

### Cloudinary
- **Cloud name:** `dp498emx3` (set in `.env`)
- **Uploads:** Signed uploads via `POST /api/sign-upload` → Upload Widget with `prepareUploadParams`
- **Folder structure:** `pawprint/pets/<uuid>/` per pet
- **Hero image:** Tagged `hero` via `POST /api/tag-hero` (best quality_analysis.focus score)
- **Transforms are URL-based** — lazy, CDN-cached, no server processing
- Refer to `.cursorrules` for all Cloudinary SDK import paths and patterns

### SMD Fields (Cloudinary Structured Metadata)
All prefixed `pawprint_`:
- `pawprint_pet_id` (string/UUID), `pawprint_pet_name`, `pawprint_species` (enum), `pawprint_breed`, `pawprint_age`, `pawprint_sex` (enum), `pawprint_temperament` (set), `pawprint_shelter_name`, `pawprint_shelter_contact`, `pawprint_shelter_location`, `pawprint_status` (enum), `pawprint_caption`

### Transforms (URL builders in `src/cloudinary/transformations.ts`)
- `heroUrl()`: `c_fill,w_800,h_600,g_auto/e_improve/f_auto,q_auto`
- `thumbnailUrl()`: `c_fill,w_300,h_300,g_auto/f_auto,q_auto`
- `socialCardUrl()`: `c_fill,w_1200,h_630,g_auto/e_improve/l_text:...`
- `platformUrl(platform)`: platform-specific sizes (Twitter 1200x675, IG 1080x1080, FB 1200x630)

### Credit-Conscious Strategy
- **Use:** `f_auto,q_auto`, `c_fill,g_auto`, `e_improve`, `l_text:` overlays
- **Never use:** `e_gen_restore`, `e_gen_background_replace`, `e_background_removal` (paid add-ons not available on free tier)
- Lazy transforms only — generate when viewed/downloaded

### Express Server
- All routes under `/api/`
- CORS configured for `localhost:5173`
- Uses Cloudinary Node SDK v2: `import { v2 as cloudinary } from 'cloudinary'`
- API secret stays server-side only — never in `VITE_` env vars
- Server `.env` uses `CLOUDINARY_URL` format

### Frontend
- HashRouter for all routing (no server-side routing needed)
- All Cloudinary SDK patterns follow `.cursorrules` (import paths, overlay patterns, plugin usage)
- TypeScript strict mode enabled
- Prefer `unknown` over `any`

## Design Reference
Primary reference: **https://ontariospca.ca/adopt/** — warm, animal-shelter aesthetic.

### Implemented Color Palette (CSS custom properties in `src/index.css`)
- **Navy** `#002b60` — navbar, footer, headings, step numbers, CTA banner bg
- **Golden yellow** `#fdb924` — primary buttons, active nav pills, paw badge, hover accents
- **Coral** `#e8604c` — secondary accent (feature icon bg)
- **Teal** `#2a9d8f` — tertiary accent (feature icon bg, section labels)
- **Warm cream** `#fefcf6` — body background
- **Text** `#1a2332` / `#4a5568` / `#8896a6` — primary / secondary / tertiary
- **Borders** `#e8dfd3` warm gray (not cool gray)

### Design Tokens
- Font: **Figtree** (Google Fonts, loaded in `index.html`)
- Border radii: `8px` / `12px` / `20px` / `28px` / `9999px` (pills)
- Max content width: `1140px`
- Navbar: 68px height, dark navy, frosted-glass-free (solid bg)
- Buttons: pill-shaped (`border-radius: 9999px`), gold bg + navy text for primary

### Design Patterns
- SVG paw-print logo in navbar and hero badge (inline SVG, not emoji)
- Hero section: navy bg with subtle radial gold/teal glows
- Feature cards: three icon color variants (gold / coral / teal)
- Steps: numbered navy circles inside bordered cards
- CTA banner: navy gradient with gold radial glow
- Footer: navy bg matching navbar, gold link hovers
- Empty states: centered with muted icon + CTA button
- Upload placeholder: dashed border, turns gold on hover

### Visual Rules
- Warm tones throughout — no cool grays or stark whites
- Card hover: lift (`translateY(-3px)`) + shadow
- Headings use `font-weight: 800`, `letter-spacing: -0.02em`
- Section labels: uppercase, small, teal, with `letter-spacing: 0.06em`
- No emoji in UI chrome — use inline SVGs for icons

## Commands
- `npm run dev` — Start Vite dev server (port 5173)
- `cd server && npm run dev` — Start Express server (port 3001)
- `npm run build` — Production build
