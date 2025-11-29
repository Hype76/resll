import { GoogleGenerativeAI } from "@google/generative-ai";

export async function analyzeItemForListing(
  images: { base64: string; mimeType: string }[],
  manualInput?: { product: string; condition: string },
) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing Gemini API key");
  }

  const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const prompt = `
You are a professional UK reseller. 
Identify the item, generate 4 titles (eBay, Facebook, Etsy, Vinted), describe it, estimate resale price (£), 
and return results as valid JSON only.
`;

  const parts = [];

  if (images?.length) {
    for (const img of images) {
      parts.push({
        inlineData: {
          data: img.base64,
          mimeType: img.mimeType,
        },
      });
    }
  }

  parts.push({ text: prompt });

  const result = await model.generateContent(parts);

  const out = result.response.text();

  try {
    return JSON.parse(out);
  } catch {
    return { raw: out };
  }
}
