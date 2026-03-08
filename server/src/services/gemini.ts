interface PetData {
  name: string;
  species: string;
  breed: string;
  age: string;
  sex: string;
  temperament: string[];
}

export interface PhotoTip {
  title: string;
  description: string;
}

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function generateCaption(petData: PetData): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const prompt = `Write a warm, engaging adoption caption for a social media post about a shelter pet. The caption should be 2-3 sentences, highlight the pet's personality, and include a call to action. Do not use hashtags. Pet details: Name: ${petData.name}, Species: ${petData.species}, Breed: ${petData.breed}, Age: ${petData.age}, Sex: ${petData.sex}, Temperament: ${petData.temperament.join(", ")}. Return only the caption text, nothing else.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No caption returned from Gemini");

  return text.trim();
}

export interface PlatformCaption {
  caption: string;
  hashtags: string[];
}

export type PlatformCaptions = Record<string, PlatformCaption>;

export async function generatePlatformCaptions(
  petData: PetData,
): Promise<PlatformCaptions> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const temperamentStr =
    petData.temperament.length > 0
      ? petData.temperament.join(", ")
      : "friendly";

  const breedTag = petData.breed
    ? petData.breed.toLowerCase().replace(/[\s-]+/g, "")
    : "";
  const speciesTag = petData.species.toLowerCase();

  const prompt = `You are a social media marketing expert specializing in animal rescue and pet adoption campaigns. Generate COMPLETELY UNIQUE captions for each platform — each must use different wording, tone, structure, and angle. Do NOT rephrase or recycle the same sentences across platforms.

Pet details:
- Name: ${petData.name}
- Species: ${petData.species}
- Breed: ${petData.breed || "Mixed breed"}
- Age: ${petData.age || "Unknown"}
- Sex: ${petData.sex || "Unknown"}
- Personality traits: ${temperamentStr}

CRITICAL RULES FOR HASHTAGS:
- Only use REAL hashtags that actually exist and are actively used on each platform
- Mix high-volume hashtags (100K+ posts) with niche ones for best reach
- Every platform's hashtag set must be DIFFERENT — do not copy-paste the same tags
- Include breed-specific tags when applicable (e.g., #${breedTag || speciesTag + "sof" + "instagram"}, #${breedTag || speciesTag + "lover"})
- Include adoption/rescue tags (e.g., #AdoptDontShop, #RescueDog, #ShelterPetsRock, #ForeverHome)
- Include engagement tags specific to each platform's algorithm
- NO made-up hashtags — every tag must be one that real users search for and follow
- Do NOT include the # symbol in the hashtags array — just the tag text

Generate captions for these 5 platforms:

1. "instagram_feed" — Warm, emotional storytelling with natural emoji use. 2-3 sentences that tug at heartstrings, highlight ${petData.name}'s personality, and end with a clear adoption CTA. Include 8-12 hashtags mixing: popular adoption tags, breed-specific tags, pet community tags, and location/discovery tags.

2. "instagram_story" — Ultra-short punchy 1-liner with emoji that creates urgency or curiosity. Max 80 characters. Designed to make people tap "See More". Include 3-5 relevant hashtags (Stories show fewer).

3. "twitter" — Witty, conversational, personality-forward. Different angle than Instagram — be clever or humorous. The caption + all hashtags together MUST fit under 280 characters total. Include 2-4 hashtags inline or at end.

4. "facebook" — Longer community-focused storytelling. 3-4 sentences painting a picture of daily life with ${petData.name}. Appeal to emotion and community (ask people to share, tag friends who need a ${speciesTag}). Include 5-7 hashtags focused on community and sharing.

5. "youtube_thumb" — Bold, attention-grabbing title overlay text ONLY. Max 50 characters. Think YouTube thumbnail text — dramatic, curiosity-driven, uses caps strategically. Return empty hashtags array.

Return ONLY a valid JSON object (no markdown, no code fences, no extra text):
{"instagram_feed":{"caption":"...","hashtags":["adoptdontshop","rescuedog",...]},"instagram_story":{"caption":"...","hashtags":["adopt","rescuedog"]},"twitter":{"caption":"...","hashtags":["AdoptDontShop","RescuePets"]},"facebook":{"caption":"...","hashtags":["adoptdontshop","shelterpets"]},"youtube_thumb":{"caption":"...","hashtags":[]}}`;

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error("No content returned from Gemini");

  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }

  try {
    return JSON.parse(cleaned) as PlatformCaptions;
  } catch {
    throw new Error("Failed to parse platform captions from Gemini response");
  }
}

export async function generatePhotoTips(
  imageUrl: string,
  petInfo: { name: string; species: string; breed: string },
  context: { totalUploaded: number; avgQuality: number },
): Promise<PhotoTip[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  // Fetch a small version of the image for analysis
  const resizedUrl = imageUrl.replace(
    "/upload/",
    "/upload/c_fill,w_600,h_400,q_auto/",
  );
  const imageRes = await fetch(resizedUrl);
  if (!imageRes.ok) throw new Error(`Failed to fetch image: ${imageRes.status}`);

  const arrayBuffer = await imageRes.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const contentType = imageRes.headers.get("content-type") || "image/jpeg";

  const prompt = `You are PawPrint, a pet adoption photo coach. Analyze this shelter pet photo and give 2-3 short, actionable tips to improve the adoption campaign.

Pet: ${petInfo.name || "Unknown"}, a ${petInfo.breed || petInfo.species || "pet"}
Photos uploaded so far: ${context.totalUploaded}
Average quality score: ${context.avgQuality > 0 ? Math.round(context.avgQuality * 100) + "%" : "N/A"}

Based on what you ACTUALLY SEE in this photo, suggest what the volunteer should photograph NEXT or how to improve. Consider:
- What type of shot is this? (close-up, full-body, action, etc.)
- What's missing from the campaign? (e.g., outdoor shot, interaction with people, different angle)
- Any quality issues? (lighting, blur, background clutter)
- What would make adopters connect emotionally?

Return ONLY a valid JSON array (no markdown, no code fences):
[{"title":"Short tip title (5 words max)","description":"1 sentence explaining why and how"}]

Rules:
- 2-3 tips only
- Be specific to what you see — don't give generic advice
- Reference actual visual elements (e.g., "the indoor fluorescent lighting" not "the lighting")
- If quality is good, suggest variety/composition tips instead
- Keep descriptions under 120 characters`;

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { inlineData: { mimeType: contentType, data: base64 } },
            { text: prompt },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error("No content returned from Gemini");

  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }

  try {
    return JSON.parse(cleaned) as PhotoTip[];
  } catch {
    throw new Error("Failed to parse photo tips from Gemini response");
  }
}
