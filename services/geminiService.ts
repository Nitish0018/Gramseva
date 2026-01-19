import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AiMatchResult, CropHealthAnalysis } from '../types';

const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export const getMarketInsight = async (cropName: string): Promise<string> => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `Explain the current market trend for ${cropName} in simple terms for a farmer in rural India. Mention potential reasons for price changes and a simple outlook for the next few weeks. Keep it concise and easy to understand.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error fetching market insight:", error);
        return "Could not get AI insight at this time. Please try again later.";
    }
};

export const getServiceProviderMatch = async (serviceQuery: string): Promise<AiMatchResult | string> => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `A farmer is looking for "${serviceQuery}". Based on typical rural service providers, suggest the best type of provider. Provide a fictional name, a strong reason for the recommendation (e.g., reliability, fair price), a rating out of 5, and a fictional contact number.
        
        Respond with this JSON structure:
        {
            "providerName": "string",
            "reason": "string",
            "rating": number,
            "contact": "string"
        }`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return JSON.parse(text) as AiMatchResult;

    } catch (error) {
        console.error("Error getting AI match:", error);
        return "Failed to find a suitable match using AI. Please browse the listings manually.";
    }
};

export const getCropHealthAnalysis = async (imageBase64: string, mimeType: string): Promise<CropHealthAnalysis | string> => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `You are an expert agricultural scientist specializing in plant pathology. Analyze the provided image of a plant leaf. Identify if there are any diseases.
        
        If the plant is healthy, respond with isHealthy: true and provide an encouraging message in the description.
        
        If a disease is detected, provide the following details:
        1. The common name of the disease.
        2. A brief, simple description of the disease for a farmer.
        3. A list of common causes or contributing factors.
        4. A list of suggested organic remedies.
        5. A list of suggested chemical remedies (mentioning common chemical names if possible).

        Respond with this JSON structure:
        {
            "isHealthy": boolean,
            "disease": "string (or N/A)",
            "description": "string",
            "causes": ["string"],
            "organicRemedies": ["string"],
            "chemicalRemedies": ["string"]
        }`;

        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: mimeType
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        return JSON.parse(text) as CropHealthAnalysis;

    } catch (error) {
        console.error("Error getting crop health analysis:", error);
        return "Failed to analyze the image. The AI model may not be able to process this request right now. Please try again later with a clear, well-lit image.";
    }
};
