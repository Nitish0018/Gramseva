import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("Error: GEMINI_API_KEY not found");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
    try {
        console.log("Fetching available models...\n");

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
        );

        const data = await response.json();

        if (data.models) {
            console.log("Available models:");
            data.models.forEach((model: any) => {
                console.log(`- ${model.name}`);
                console.log(`  Display Name: ${model.displayName}`);
                console.log(`  Supported Methods: ${model.supportedGenerationMethods?.join(', ')}`);
                console.log("");
            });
        } else {
            console.log("Response:", JSON.stringify(data, null, 2));
        }
    } catch (error: any) {
        console.error("Error:", error.message);
    }
}

listModels();
