interface PetData {
  name: string;
  species: string;
  breed: string;
  age: string;
  sex: string;
  temperament: string[];
}

export interface PlatformCaption {
  caption: string;
  hashtags: string[];
}

export type PlatformCaptions = Record<string, PlatformCaption>;

export interface ImageAnalysisResult {
  heroSuitability: string;
  enhancements: Array<{ icon: 'sun' | 'palette' | 'contrast' | 'focus'; label: string; description: string }>;
  overallNote: string;
  suggestedTransformations: string[];
}

interface ImageContext {
  isHero: boolean;
  qualityScore: number | null;
  totalImages: number;
  imageIndex: number;
}

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No content returned from Gemini');

  return text.trim();
}

async function callGeminiMultimodal(imageBase64: string, mimeType: string, prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { inlineData: { mimeType, data: imageBase64 } },
          { text: prompt },
        ],
      }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No content returned from Gemini');

  return text.trim();
}

export async function analyzeImageWithGemini(
  imageUrl: string,
  petInfo: { name: string; species: string; breed: string },
  context: ImageContext,
): Promise<ImageAnalysisResult> {
  // Fetch a resized version to reduce payload
  const resizedUrl = imageUrl.replace('/upload/', '/upload/c_fill,w_800,h_600,q_auto/');
  const imageRes = await fetch(resizedUrl);
  if (!imageRes.ok) throw new Error(`Failed to fetch image: ${imageRes.status}`);

  const arrayBuffer = await imageRes.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const contentType = imageRes.headers.get('content-type') || 'image/jpeg';

  const roleLabel = context.isHero ? 'HERO photo (main profile image, used on social cards)' : `Gallery photo ${context.imageIndex} of ${context.totalImages}`;
  const qualityNote = context.qualityScore !== null
    ? `Cloudinary focus/quality score: ${Math.round(context.qualityScore * 100)}%`
    : 'No quality score available';

  const prompt = `You are an expert photo analyst for a pet adoption platform called PawPrint. Analyze this shelter pet photo and evaluate how well it works for an adoption campaign.

Pet info: ${petInfo.name}, a ${petInfo.breed || petInfo.species} (${petInfo.species})
Photo role: ${roleLabel}
${qualityNote}

The following Cloudinary transformations are already applied to all photos:
- Smart crop with face/subject detection (g_auto)
- Auto image improvement (e_improve)
- Auto format selection (f_auto)
- High quality output (q_90)

Analyze what you ACTUALLY SEE in this photo — the lighting, background, composition, the pet's expression/posture, and any issues. Then explain how each applied enhancement specifically helps THIS image.

Return ONLY a valid JSON object in this exact format (no markdown, no code fences, no extra text):
{"heroSuitability":"1-2 sentences on why this photo is or isn't ideal as the hero/main photo for this pet's adoption profile","enhancements":[{"icon":"sun","label":"short label","description":"specific description of what this enhancement does for THIS image"},{"icon":"palette","label":"short label","description":"specific description"},{"icon":"contrast","label":"short label","description":"specific description"}],"overallNote":"1-2 sentence summary of overall photo quality and impact","suggestedTransformations":["any additional Cloudinary transformations that could help, or empty array"]}

Rules for the enhancements array:
- Include 2-4 items
- icon must be one of: "sun" (lighting/exposure), "palette" (color/saturation), "contrast" (contrast/detail), "focus" (sharpness/blur)
- Be specific about what you see — don't use generic descriptions
- Reference actual visual elements (e.g., "the warm indoor lighting creates a slight orange cast" not "lighting adjusted")

Rules for suggestedTransformations:
- Only suggest if genuinely helpful (e.g., "e_art:audrey" for stylistic effect, "e_background_removal" if background is cluttered)
- Return empty array if no additional transformations needed`;

  const raw = await callGeminiMultimodal(base64, contentType, prompt);

  let cleaned = raw;
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }

  try {
    return JSON.parse(cleaned) as ImageAnalysisResult;
  } catch {
    throw new Error('Failed to parse image analysis from Gemini response');
  }
}

export async function generateCaption(petData: PetData): Promise<string> {
  const prompt = `Write a warm, engaging adoption caption for a social media post about a shelter pet. The caption should be 2-3 sentences, highlight the pet's personality, and include a call to action. Do not use hashtags. Pet details: Name: ${petData.name}, Species: ${petData.species}, Breed: ${petData.breed}, Age: ${petData.age}, Sex: ${petData.sex}, Temperament: ${petData.temperament.join(', ')}. Return only the caption text, nothing else.`;

  return callGemini(prompt);
}

export async function generatePlatformCaptions(petData: PetData): Promise<PlatformCaptions> {
  const temperamentStr = petData.temperament.length > 0
    ? petData.temperament.join(', ')
    : 'friendly';

  const prompt = `Generate tailored social media adoption captions for a shelter pet. Each caption must match the platform's style, audience, and character limits. Include trending, relevant hashtags for pet adoption.

Pet details:
- Name: ${petData.name}
- Species: ${petData.species}
- Breed: ${petData.breed || 'Mixed'}
- Age: ${petData.age || 'Unknown'}
- Sex: ${petData.sex || 'Unknown'}
- Personality: ${temperamentStr}

Generate captions for these platforms:

1. "instagram_feed" — Warm, emotional, use emoji naturally. 2-3 sentences with a call to action. Include 8-10 hashtags mixing popular adoption tags with breed-specific ones.

2. "instagram_story" — Super short punchy 1-liner with emoji, designed to make people swipe up or tap. Max 80 characters for the caption. Include 3-4 hashtags.

3. "twitter" — Concise, witty, conversational. The caption + hashtags together must fit under 280 characters. Include 3-5 hashtags.

4. "facebook" — Longer, storytelling tone. 3-4 sentences that paint a picture of life with this pet. Community-focused call to action (share, tag a friend). Include 5-6 hashtags.

5. "youtube_thumb" — Short attention-grabbing title text only, like a YouTube thumbnail overlay. Max 50 characters. No hashtags needed (return empty array).

Return ONLY a valid JSON object in this exact format (no markdown, no code fences, no extra text):
{"instagram_feed":{"caption":"...","hashtags":["adoptdontshop","rescuedog",...]},"instagram_story":{"caption":"...","hashtags":["adopt","rescuedog"]},"twitter":{"caption":"...","hashtags":["AdoptDontShop","RescuePets"]},"facebook":{"caption":"...","hashtags":["adoptdontshop","shelterpets"]},"youtube_thumb":{"caption":"...","hashtags":[]}}`;

  const raw = await callGemini(prompt);

  // Strip markdown fences if Gemini wraps the JSON
  let cleaned = raw;
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }

  try {
    const parsed = JSON.parse(cleaned) as PlatformCaptions;
    return parsed;
  } catch {
    throw new Error('Failed to parse platform captions from Gemini response');
  }
}
