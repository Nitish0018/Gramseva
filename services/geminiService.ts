import { GoogleGenAI, Type } from "@google/genai";
import type { AiMatchResult, CropHealthAnalysis } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getMarketInsight = async (cropName: string): Promise<string> => {
  try {
    const prompt = `Explain the current market trend for ${cropName} in simple terms for a farmer in rural India. Mention potential reasons for price changes and a simple outlook for the next few weeks. Keep it concise and easy to understand.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return response.text;
  } catch (error) {
    console.error("Error fetching market insight:", error);
    return "Could not get AI insight at this time. Please try again later.";
  }
};

export const getServiceProviderMatch = async (serviceQuery: string): Promise<AiMatchResult | string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `A farmer is looking for "${serviceQuery}". Based on typical rural service providers, suggest the best type of provider. Provide a fictional name, a strong reason for the recommendation (e.g., reliability, fair price), a rating out of 5, and a fictional contact number.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        providerName: { type: Type.STRING },
                        reason: { type: Type.STRING },
                        rating: { type: Type.NUMBER },
                        contact: { type: Type.STRING }
                    },
                    required: ["providerName", "reason", "rating", "contact"]
                }
            }
        });

        const jsonText = response.text.trim();
        const result: AiMatchResult = JSON.parse(jsonText);
        return result;

    } catch (error) {
        console.error("Error getting AI match:", error);
        return "Failed to find a suitable match using AI. Please browse the listings manually.";
    }
};

export const getCropHealthAnalysis = async (imageBase64: string, mimeType: string): Promise<CropHealthAnalysis | string> => {
    try {
        const prompt = `You are an expert agricultural scientist specializing in plant pathology. Analyze the provided image of a plant leaf. Identify if there are any diseases.
        
        If the plant is healthy, respond with isHealthy: true and provide an encouraging message in the description.
        
        If a disease is detected, provide the following details:
        1. The common name of the disease.
        2. A brief, simple description of the disease for a farmer.
        3. A list of common causes or contributing factors.
        4. A list of suggested organic remedies.
        5. A list of suggested chemical remedies (mentioning common chemical names if possible).

        Provide your response in the specified JSON format.`;
        
        const imagePart = {
            inlineData: {
                mimeType: mimeType,
                data: imageBase64,
            },
        };

        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isHealthy: { type: Type.BOOLEAN },
                        disease: { type: Type.STRING, description: "Set to 'N/A' if healthy." },
                        description: { type: Type.STRING },
                        causes: { type: Type.ARRAY, items: { type: Type.STRING } },
                        organicRemedies: { type: Type.ARRAY, items: { type: Type.STRING } },
                        chemicalRemedies: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["isHealthy", "disease", "description", "causes", "organicRemedies", "chemicalRemedies"]
                }
            }
        });

        const jsonText = response.text;
        const result: CropHealthAnalysis = JSON.parse(jsonText);
        return result;

    } catch (error) {
        console.error("Error getting crop health analysis:", error);
        return "Failed to analyze the image. The AI model may not be able to process this request right now. Please try again later with a clear, well-lit image.";
    }
};
