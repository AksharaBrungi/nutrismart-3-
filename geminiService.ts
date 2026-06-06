
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { DetectionResult, NutritionData, ReverseSearchResult } from "./types";

// Always use the process.env.GEMINI_API_KEY directly for initialization as per guidelines
let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set. Please make sure your .env file is saved and contains GEMINI_API_KEY.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function analyzeFoodImage(base64Image: string, targets: NutritionData): Promise<DetectionResult> {
  const ai = getAI();
  const modelName = "gemini-3.1-flash-lite-preview";
  const prompt = `
    Analyze Nutri-Smart meal:
    1. Detect items with [ymin, xmin, ymax, xmax] (0-1000).
    2. Nutrition/100g + total weight.
    3. Healthier cooking advice.
    4. 3 alternatives for targets: Cal:${targets.calories}, P:${targets.protein}g, C:${targets.carbs}g, F:${targets.fat}g.
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: [{ parts: [{ inlineData: { mimeType: "image/jpeg", data: base64Image } }, { text: prompt }] }],
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                box: {
                  type: Type.OBJECT,
                  properties: { ymin: { type: Type.NUMBER }, xmin: { type: Type.NUMBER }, ymax: { type: Type.NUMBER }, xmax: { type: Type.NUMBER } },
                },
                nutritionPer100g: {
                  type: Type.OBJECT,
                  properties: { calories: { type: Type.NUMBER }, protein: { type: Type.NUMBER }, carbs: { type: Type.NUMBER }, fat: { type: Type.NUMBER }, fiber: { type: Type.NUMBER } },
                },
                estimatedWeightGrams: { type: Type.NUMBER },
                cookingMethodAdvice: { type: Type.STRING }
              },
              required: ["id", "name", "nutritionPer100g", "estimatedWeightGrams"]
            }
          },
          smartAlternatives: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                reason: { type: Type.STRING },
                estimatedMacros: { type: Type.OBJECT, properties: { calories: { type: Type.NUMBER }, protein: { type: Type.NUMBER }, carbs: { type: Type.NUMBER }, fat: { type: Type.NUMBER } } }
              },
            }
          }
        }
      }
    }
  });
  if (!response.text) throw new Error("AI response was empty.");
  return JSON.parse(response.text);
}

// Added to fix the error in components/ManualEntryModal.tsx
export async function getRecommendationsForMacros(macros: NutritionData, targets: NutritionData): Promise<{ alternatives: { name: string, reason: string }[] }> {
  const ai = getAI();
  const modelName = "gemini-3.1-flash-lite-preview";
  const prompt = `
    Meal: Cal:${macros.calories}, P:${macros.protein}g, C:${macros.carbs}g, F:${macros.fat}g.
    Targets: Cal:${targets.calories}, P:${targets.protein}g, C:${targets.carbs}g, F:${targets.fat}g.
    Suggest 3 healthier swaps.
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: [{ text: prompt }],
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          alternatives: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                reason: { type: Type.STRING }
              },
              required: ["name", "reason"]
            }
          }
        },
        required: ["alternatives"]
      }
    }
  });
  if (!response.text) throw new Error("AI response was empty.");
  return JSON.parse(response.text);
}

export async function reverseNutritionSearch(inputMacros: Partial<NutritionData>): Promise<ReverseSearchResult[]> {
  const ai = getAI();
  const modelName = "gemini-3.1-flash-lite-preview";
  const prompt = `
    Reverse Search: Find 3 meals matching Cal:${inputMacros.calories}, P:${inputMacros.protein}g, C:${inputMacros.carbs}g.
    Include ingredients and cooking tips.
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: [{ text: prompt }],
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            mealName: { type: Type.STRING },
            ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            macros: {
              type: Type.OBJECT,
              properties: { calories: { type: Type.NUMBER }, protein: { type: Type.NUMBER }, carbs: { type: Type.NUMBER }, fat: { type: Type.NUMBER }, fiber: { type: Type.NUMBER } }
            },
            cookingTips: { type: Type.STRING }
          }
        }
      }
    }
  });
  if (!response.text) throw new Error("AI response was empty.");
  return JSON.parse(response.text);
}
