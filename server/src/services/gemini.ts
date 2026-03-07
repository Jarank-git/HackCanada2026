interface PetData {
  name: string;
  species: string;
  breed: string;
  age: string;
  sex: string;
  temperament: string[];
}

export async function generateCaption(petData: PetData): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const prompt = `Write a warm, engaging adoption caption for a social media post about a shelter pet. The caption should be 2-3 sentences, highlight the pet's personality, and include a call to action. Do not use hashtags. Pet details: Name: ${petData.name}, Species: ${petData.species}, Breed: ${petData.breed}, Age: ${petData.age}, Sex: ${petData.sex}, Temperament: ${petData.temperament.join(", ")}. Return only the caption text, nothing else.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
