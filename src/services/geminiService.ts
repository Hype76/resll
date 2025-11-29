import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ListingResult, SearchSource, UserSettings } from "../types";

// Using the Pro model for expert knowledge on products and pricing
const MODEL_NAME = 'gemini-3-pro-preview';

const listingSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "An SEO-optimized title for eBay UK (max 80 characters). Include Brand, Model, Key Features. Keyword heavy.",
    },
    facebookTitle: {
      type: Type.STRING,
      description: "A human-friendly title for Facebook Marketplace. Short, clean, no keyword stuffing. Format: 'Brand Model - Size/Key Spec'.",
    },
    etsyTitle: {
      type: Type.STRING,
      description: "An aesthetic title for Etsy. Use pipes '|' to separate phrases. Focus on 'Vintage', 'Gift', 'Retro', 'Handmade' keywords if applicable. Max 140 chars.",
    },
    vintedTitle: {
      type: Type.STRING,
      description: "A standardized Vinted title. Format: 'Brand + Item Name + Size + Condition'. E.g. 'Nike Air Max 90 Size 10 Very Good'.",
    },
    description: {
      type: Type.STRING,
      description: "A professional sales description for a UK audience. Use British English spelling (e.g. Colour).",
    },
    shortDescription: {
      type: Type.STRING,
      description: "A 1-2 sentence punchy summary.",
    },
    category: {
      type: Type.STRING,
      description: "Recommended eBay.co.uk category path.",
    },
    keywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 5-10 relevant search tags.",
    },
    etsyTags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of exactly 13 short tags optimized for Etsy SEO (e.g. 'Y2K Fashion', 'Gift for Him').",
    },
    brand: { type: Type.STRING, description: "Brand name if visible." },
    model: { type: Type.STRING, description: "Model number or name if visible." },
    era: { type: Type.STRING, description: "The estimated era or decade of the item (e.g. '1990s', 'Art Deco', 'Modern', 'Vintage')." },
    itemSpecifics: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          key: { type: Type.STRING },
          value: { type: Type.STRING },
        },
      },
      description: "Key-value pairs of product specs (e.g. Colour, Size, Material).",
    },
    condition: {
      type: Type.STRING,
      enum: ["New", "Like New", "Good", "Fair", "For Parts"],
      description: "Visual condition assessment.",
    },
    conditionNotes: {
      type: Type.STRING,
      description: "Explanation of condition (e.g. 'Visible scuffs', 'Box included').",
    },
    estimatedPrice: {
      type: Type.OBJECT,
      properties: {
        low: { type: Type.NUMBER },
        high: { type: Type.NUMBER },
        currency: { type: Type.STRING },
      },
      description: "Estimated UK market value (£ GBP) based on sold listings.",
    },
    profitPotential: {
      type: Type.STRING,
      enum: ["High", "Medium", "Low"],
      description: "Assessment of resell value. High = valuable/collectible. Low = cheap/common.",
    },
    demandLevel: {
      type: Type.STRING,
      enum: ["High Demand", "Steady", "Slow Mover"],
      description: "How quickly is this item likely to sell based on popularity?",
    },
    vintedParcelSize: {
      type: Type.STRING,
      enum: ["Small", "Medium", "Large"],
      description: "Estimate Vinted Parcel size. Small (Accessory/T-shirt/Under 500g). Medium (Jeans/Dress/Shoes/Under 1kg). Large (Coat/Boots/Heavy/Over 1kg).",
    },
    platformSuitability: {
        type: Type.OBJECT,
        properties: {
            ebay: { type: Type.BOOLEAN, description: "Almost always True." },
            facebook: { type: Type.BOOLEAN, description: "True if item is suitable for local pickup or shipping. False for prohibited items." },
            etsy: { type: Type.BOOLEAN, description: "True ONLY if item is Vintage (20+ years old) or Handmade/Craft Supply. False for modern electronics/tools." },
            vinted: { type: Type.BOOLEAN, description: "True ONLY if item fits Vinted categories: Clothing, Shoes, Accessories, Beauty, Kids toys, Small Homeware. FALSE for Power Tools, Large Electronics, Kitchen Appliances." },
        },
        required: ["ebay", "facebook", "etsy", "vinted"],
        description: "Determine which platforms this item is legally/rules-wise allowed on.",
    },
    arbitrage: {
      type: Type.OBJECT,
      properties: {
        isScreenshot: { type: Type.BOOLEAN, description: "True if the image appears to be a screenshot of a marketplace listing (Facebook, Vinted, etc)." },
        detectedBuyPrice: { type: Type.NUMBER, description: "If a price is visible in the image (e.g. £20), extract it as the Buy Price. 0 if not found." },
        platform: { type: Type.STRING, description: "Name of the platform in the screenshot (e.g. 'Facebook Marketplace', 'Vinted') if applicable." },
        ebayFees: { type: Type.NUMBER, description: "Estimated eBay fees based on UK standards." },
        shippingCost: { type: Type.NUMBER, description: "Estimated shipping cost." },
        roi: { type: Type.NUMBER, description: "Calculated ROI %: ((Sell Price - Buy Price - Fees) / Buy Price) * 100. Use 0 if no buy price." },
      },
      description: "Analysis of the spread between buying price and selling price.",
    }
  },
  required: ["title", "facebookTitle", "etsyTitle", "vintedTitle", "description", "condition", "estimatedPrice", "profitPotential", "demandLevel", "vintedParcelSize", "platformSuitability"],
};

export const analyzeItemForListing = async (
  images: { base64: string; mimeType: string }[],
  manualInput?: { product: string; condition: string },
  settings?: UserSettings
): Promise<ListingResult> => {
  try {
    const apiKey = import.meta.env.VITE_API_KEY;

    if (!apiKey) {
      throw new Error("API Key is missing. Please check your Netlify Environment Variables. Ensure it is named 'VITE_API_KEY'.");
    }

    const ai = new GoogleGenAI({ apiKey });

    // Use settings for prompt context
    const shippingCost = settings?.defaultShippingCost !== undefined ? settings.defaultShippingCost : 3.50;
    const feeRate = settings?.defaultFeeRate !== undefined ? settings.defaultFeeRate : 12.8;

    let prompt = `
      You are an expert UK Reseller, Vintage Curator, and Arbitrage Specialist.
      
      YOUR TASK:
      Analyze the input images to create a professional listing optimized for FOUR platforms: eBay, Facebook Marketplace, Etsy, and Vinted.
      Use ALL provided images to gather details (e.g. look for tags, defects, brand logos across different angles).
    `;

    // Inject manual context if provided
    if (manualInput?.product) {
      prompt += `\nUSER CONTEXT: The user has explicitly identified the item as: "${manualInput.product}". Prioritize this identification.`;
    }
    if (manualInput?.condition) {
      prompt += `\nUSER CONTEXT: The user specifies the condition is: "${manualInput.condition}". Adjust your pricing and description to match this condition.`;
    }

    prompt += `
      STEP 1: DETECT MODE
      - If an image is provided: Is this a screenshot of a listing? If yes, extract the ASKING PRICE shown in the image. This is the "Buy Price".
      - If it is a normal photo or no photo is provided, the "Buy Price" is 0/Unknown.
      
      STEP 2: VALUATION & ERA
      - Identify the item precisely.
      - Estimate the ERA/DECADE (e.g. 1970s, 90s, Modern). Crucial for Etsy.
      - Search for 'sold' listings on eBay.co.uk to find the TRUE market value in GBP (£).
      
      STEP 3: PLATFORM SUITABILITY (CRITICAL)
      - JUDGE STRICTLY: Is this item allowed on Vinted? (YES: Clothes, Shoes, Accessories, Beauty, Kids toys, Small Homeware. NO: Power Tools, Kitchen Appliances, Large Tech).
      - JUDGE STRICTLY: Is this item allowed on Etsy? (YES: Vintage 20+ years, Handmade. NO: Modern mass-produced electronics/tools).
      
      STEP 4: ARBITRAGE CALCULATION
      - Calculate eBay Fees using a rate of ${feeRate}% + 30p.
      - Assume Shipping Cost is £${shippingCost} (unless item is very large/heavy, then adjust up).
      - If a Buy Price was detected, calculate the Net Profit and ROI.
      
      STEP 5: LISTING CREATION
      - Create FOUR titles (even if platform is unsuitable, generate just in case):
        1. eBay Title: Keyword rich, max 80 chars. (Technical)
        2. Facebook Title: Short, friendly, no spam keywords. (Human)
        3. Etsy Title: Aesthetic, descriptive, uses dividers. "Vintage [Item] | [Era] Style | Gift for Him".
        4. Vinted Title: "Brand Item Size Condition". E.g. "Zara Jeans 32W Very Good".
      - Generate exactly 13 short, punchy tags for Etsy.
      - Determine Vinted Parcel Size (Small/Medium/Large) based on item bulk.
      - Write a professional description suitable for all platforms.
      
      Use the 'googleSearch' tool to find accurate UK pricing and specs.
    `;

    const parts = [];
    
    // Add all images to the request
    if (images && images.length > 0) {
      images.forEach(img => {
        parts.push({
          inlineData: {
            data: img.base64,
            mimeType: img.mimeType,
          },
        });
      });
    }
    
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: parts,
      },
      config: {
        tools: [{ googleSearch: {} }], 
        responseMimeType: "application/json",
        responseSchema: listingSchema,
        thinkingConfig: { thinkingBudget: 2048 },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response received from the model.");
    }

    let rawResult;
    try {
      rawResult = JSON.parse(text);
    } catch (e) {
      const match = text.match(/```json\n([\s\S]*?)\n```/);
      if (match) {
        rawResult = JSON.parse(match[1]);
      } else {
        throw new Error("Failed to parse JSON response");
      }
    }

    // Extract Sources
    const verifiedSources: SearchSource[] = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          verifiedSources.push({
            title: chunk.web.title,
            uri: chunk.web.uri
          });
        }
      });
    }

    // Force GBP symbol if missing or generic
    if (rawResult.estimatedPrice && (!rawResult.estimatedPrice.currency || rawResult.estimatedPrice.currency === '$')) {
      rawResult.estimatedPrice.currency = '£';
    }

    // Post-process Arbitrage Data (Double Check Math with Settings)
    if (rawResult.estimatedPrice && rawResult.arbitrage) {
        const sellPrice = rawResult.estimatedPrice.high;
        const buyPrice = rawResult.arbitrage.detectedBuyPrice || 0;
        
        // Recalculate fees locally to be safe
        const feePercent = feeRate / 100;
        const calculatedFees = (sellPrice * feePercent) + 0.30;
        const shipping = rawResult.arbitrage.shippingCost || shippingCost;
        
        const netLow = rawResult.estimatedPrice.low - buyPrice - calculatedFees - shipping;
        const netHigh = rawResult.estimatedPrice.high - buyPrice - calculatedFees - shipping;
        
        rawResult.arbitrage.ebayFees = parseFloat(calculatedFees.toFixed(2));
        rawResult.arbitrage.shippingCost = parseFloat(shipping.toFixed(2));
        
        rawResult.arbitrage.netProfit = {
            low: parseFloat(netLow.toFixed(2)),
            high: parseFloat(netHigh.toFixed(2))
        };
    }

    const result: ListingResult = {
      ...rawResult,
      verifiedSources: verifiedSources,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    return result;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};