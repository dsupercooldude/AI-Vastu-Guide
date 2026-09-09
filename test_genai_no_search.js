import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  const models = ['gemini-3.5-flash', 'gemini-3.1-pro-preview', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
        model: model,
      });
      console.log(`Success with ${model}:`, response.text);
    } catch (e) {
      console.error(`Error with ${model}:`, e.message);
    }
  }
}
test();
